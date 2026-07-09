import { prisma } from "@/lib/db";
import {
  fetchMessageIdsSince,
  fetchMessageFull,
  findBodyPart,
  headerValue,
  htmlToReadableText,
  SUPPORTED_BANK_SENDERS,
} from "@/lib/gmail";
import { askClaudeToExtractTransaction } from "@/lib/claude";
import { parseTransaction } from "@/lib/transaction";
import { persistTransaction } from "@/lib/persist-transaction";

export type ImportFailureStage = "fetch" | "extraction" | "validation" | "persistence" | "other";

export type ImportFailure = {
  gmailMessageId: string;
  subject: string;
  sender: string;
  stage: ImportFailureStage;
  message: string;
};

export type ImportSummary = {
  processed: number;
  /** Or "would be imported" when dryRun is true. */
  imported: number;
  skipped: number;
  /** failures.length -- always 0 in dry-run mode, nothing is attempted that can fail. */
  failed: number;
  durationMs: number;
  dryRun: boolean;
  failures: ImportFailure[];
  /** Grouped counts for a quick "what kind of failures are these" read,
   * e.g. { "Validation failure": 5, "Non-transaction email": 3, "Extraction failure": 2 }. */
  failureBreakdown: Record<string, number>;
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Best-effort re-parse of Claude's raw response, used only to enrich
// diagnostics on a validation failure (e.g. to surface the model's own
// "reasoning" for why an email isn't a transaction). Deliberately separate
// from -- and not as strict as -- the real parseTransaction() in
// transaction.ts, which remains the sole source of truth for pass/fail.
export function tryParseForDiagnostics(responseText: string): Record<string, unknown> | null {
  try {
    const trimmed = responseText.trim();
    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    const withoutFences = fenceMatch ? fenceMatch[1] : trimmed;
    const start = withoutFences.indexOf("{");
    const end = withoutFences.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) return null;
    const parsed: unknown = JSON.parse(withoutFences.slice(start, end + 1));
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

// The extraction prompt sets every field to null (except "reasoning") when
// the email isn't a transaction alert at all -- that's a validation failure
// like any other (bank/amount/etc. don't satisfy the schema), but it's a
// genuinely different case from a real bug and worth its own category.
export function classifyValidationFailure(responseText: string, errors: string[]): string {
  const parsed = tryParseForDiagnostics(responseText);
  if (parsed && parsed.bank == null && typeof parsed.reasoning === "string") {
    return `Not a transaction email: ${parsed.reasoning}`;
  }
  return errors.join("; ");
}

export function categorize(failure: ImportFailure): string {
  if (failure.message.startsWith("Not a transaction email:")) return "Non-transaction email";
  return `${failure.stage[0].toUpperCase()}${failure.stage.slice(1)} failure`;
}

export async function runHistoricalImport(
  accessToken: string,
  since: Date,
  options?: { dryRun?: boolean },
): Promise<ImportSummary> {
  const dryRun = options?.dryRun ?? false;
  const startedAt = Date.now();

  const messageIds = await fetchMessageIdsSince(accessToken, SUPPORTED_BANK_SENDERS, since);

  let imported = 0;
  let skipped = 0;
  const failures: ImportFailure[] = [];

  for (const id of messageIds) {
    try {
      const existing = await prisma.transaction.findUnique({ where: { gmailMessageId: id } });
      if (existing) {
        skipped++;
        continue;
      }

      if (dryRun) {
        imported++;
        continue;
      }

      let message;
      try {
        message = await fetchMessageFull(accessToken, id);
      } catch (err) {
        failures.push({
          gmailMessageId: id,
          subject: "(unknown)",
          sender: "(unknown)",
          stage: "fetch",
          message: errorMessage(err),
        });
        continue;
      }

      const headers = message.payload?.headers ?? [];
      const subject = headerValue(headers, "Subject");
      const sender = headerValue(headers, "From");

      const plainText = findBodyPart(message.payload, "text/plain");
      const html = findBodyPart(message.payload, "text/html");
      const emailText = plainText ?? (html ? htmlToReadableText(html) : null);
      if (!emailText) {
        failures.push({
          gmailMessageId: id,
          subject,
          sender,
          stage: "extraction",
          message: "No plain text or HTML body found to extract from.",
        });
        continue;
      }

      const receivedAt = message.internalDate ? new Date(Number(message.internalDate)) : null;
      const receivedAtDate = receivedAt ? receivedAt.toISOString().slice(0, 10) : null;
      const gmailReceivedAtIso = receivedAt ? receivedAt.toISOString() : null;

      let responseText: string;
      try {
        ({ responseText } = await askClaudeToExtractTransaction(emailText, receivedAtDate));
      } catch (err) {
        failures.push({
          gmailMessageId: id,
          subject,
          sender,
          stage: "extraction",
          message: errorMessage(err),
        });
        continue;
      }

      const validation = parseTransaction(responseText);
      if (!validation.success) {
        failures.push({
          gmailMessageId: id,
          subject,
          sender,
          stage: "validation",
          message: classifyValidationFailure(responseText, validation.errors),
        });
        continue;
      }

      try {
        await persistTransaction(validation.transaction, {
          messageId: id,
          threadId: message.threadId,
          receivedAtIso: gmailReceivedAtIso,
        });
        imported++;
      } catch (err) {
        failures.push({
          gmailMessageId: id,
          subject,
          sender,
          stage: "persistence",
          message: errorMessage(err),
        });
      }
    } catch (err) {
      failures.push({
        gmailMessageId: id,
        subject: "(unknown)",
        sender: "(unknown)",
        stage: "other",
        message: errorMessage(err),
      });
    }
  }

  const failureBreakdown: Record<string, number> = {};
  for (const failure of failures) {
    const key = categorize(failure);
    failureBreakdown[key] = (failureBreakdown[key] ?? 0) + 1;
  }

  return {
    processed: messageIds.length,
    imported,
    skipped,
    failed: failures.length,
    durationMs: Date.now() - startedAt,
    dryRun,
    failures,
    failureBreakdown,
  };
}
