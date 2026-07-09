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

export type ImportStatus = "imported" | "skipped" | "ignored" | "failed";
export type ImportFailureStage = "fetch" | "extraction" | "validation" | "persistence" | "other";

export type ImportRecord = {
  gmailMessageId: string;
  subject: string;
  sender: string;
  status: ImportStatus;
  /** Reason (ignored), error message (failed), merchant/amount summary
   * (imported), or a short note (skipped). */
  detail: string;
  /** Only present when status === "failed" -- feeds failureBreakdown. */
  stage?: ImportFailureStage;
  /** The message's real Gmail receive time -- present whenever the message
   * was actually fetched (i.e. every status except "skipped", and "failed"
   * at the "fetch" stage itself). Used by import-checkpoint.ts to advance
   * the sync checkpoint past processed-but-not-imported emails (ignored,
   * failed) that never get a Transaction row of their own. */
  receivedAt?: Date;
};

export type ImportSummary = {
  processed: number;
  imported: number;
  skipped: number;
  /** Correctly recognized as not a transaction alert -- not a failure. */
  ignored: number;
  /** A real error (fetch/extraction/validation/persistence/other). */
  failed: number;
  durationMs: number;
  dryRun: boolean;
  records: ImportRecord[];
  /** Grouped counts of *failed* records only, by stage, e.g.
   * { "Extraction failure": 2, "Validation failure": 1 }. */
  failureBreakdown: Record<string, number>;
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Best-effort re-parse of Claude's raw response, used only to detect the
// "not a transaction alert" case for reporting purposes. Deliberately
// separate from -- and not as strict as -- the real parseTransaction() in
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

// The extraction prompt sets every transaction-specific field to null
// (except "reasoning") when the email isn't a financial transaction --
// Claude still often knows which bank sent the email even then, so "bank"
// alone isn't a reliable signal, but "amount" is: TransactionSchema
// requires it to be a positive number for any real transaction, so a null
// amount can only mean the non-transaction branch was taken. Returns the
// model's own reasoning when that's the case, so the caller can route it
// to "ignored" rather than "failed" -- this is the pipeline working as
// intended, not a bug -- otherwise returns null (a genuine schema violation).
export function getNonTransactionReason(responseText: string): string | null {
  const parsed = tryParseForDiagnostics(responseText);
  if (parsed && parsed.amount == null && typeof parsed.reasoning === "string") {
    return parsed.reasoning;
  }
  return null;
}

function stageLabel(stage: ImportFailureStage): string {
  return `${stage[0].toUpperCase()}${stage.slice(1)} failure`;
}

export async function runHistoricalImport(
  accessToken: string,
  since: Date,
  options?: { dryRun?: boolean },
): Promise<ImportSummary> {
  const dryRun = options?.dryRun ?? false;
  const startedAt = Date.now();

  const messageIds = await fetchMessageIdsSince(accessToken, SUPPORTED_BANK_SENDERS, since);

  const records: ImportRecord[] = [];

  for (const id of messageIds) {
    try {
      // Skip-check happens before any Gmail fetch, which is what keeps
      // reruns cheap -- fetching metadata just to show subject/sender for
      // rows we're intentionally not processing would reintroduce a Gmail
      // API call per already-imported email on every rerun.
      const existing = await prisma.transaction.findUnique({ where: { gmailMessageId: id } });
      if (existing) {
        records.push({
          gmailMessageId: id,
          subject: "(not fetched)",
          sender: "(not fetched)",
          status: "skipped",
          detail: "Already imported",
        });
        continue;
      }

      if (dryRun) {
        records.push({
          gmailMessageId: id,
          subject: "(not fetched)",
          sender: "(not fetched)",
          status: "imported",
          detail: "Would import (dry run)",
        });
        continue;
      }

      let message;
      try {
        message = await fetchMessageFull(accessToken, id);
      } catch (err) {
        records.push({
          gmailMessageId: id,
          subject: "(unknown)",
          sender: "(unknown)",
          status: "failed",
          stage: "fetch",
          detail: errorMessage(err),
        });
        continue;
      }

      const headers = message.payload?.headers ?? [];
      const subject = headerValue(headers, "Subject");
      const sender = headerValue(headers, "From");

      const receivedAt = message.internalDate ? new Date(Number(message.internalDate)) : null;
      const receivedAtDate = receivedAt ? receivedAt.toISOString().slice(0, 10) : null;
      const gmailReceivedAtIso = receivedAt ? receivedAt.toISOString() : null;

      const plainText = findBodyPart(message.payload, "text/plain");
      const html = findBodyPart(message.payload, "text/html");
      const emailText = plainText ?? (html ? htmlToReadableText(html) : null);
      if (!emailText) {
        records.push({
          gmailMessageId: id,
          subject,
          sender,
          status: "failed",
          stage: "extraction",
          detail: "No plain text or HTML body found to extract from.",
          receivedAt: receivedAt ?? undefined,
        });
        continue;
      }

      let responseText: string;
      try {
        ({ responseText } = await askClaudeToExtractTransaction(emailText, receivedAtDate));
      } catch (err) {
        records.push({
          gmailMessageId: id,
          subject,
          sender,
          status: "failed",
          stage: "extraction",
          detail: errorMessage(err),
          receivedAt: receivedAt ?? undefined,
        });
        continue;
      }

      const validation = parseTransaction(responseText);
      if (!validation.success) {
        const nonTransactionReason = getNonTransactionReason(responseText);
        records.push(
          nonTransactionReason
            ? {
                gmailMessageId: id,
                subject,
                sender,
                status: "ignored",
                detail: nonTransactionReason,
                receivedAt: receivedAt ?? undefined,
              }
            : {
                gmailMessageId: id,
                subject,
                sender,
                status: "failed",
                stage: "validation",
                detail: validation.errors.join("; "),
                receivedAt: receivedAt ?? undefined,
              },
        );
        continue;
      }

      try {
        const persisted = await persistTransaction(validation.transaction, {
          messageId: id,
          threadId: message.threadId,
          receivedAtIso: gmailReceivedAtIso,
        });
        records.push({
          gmailMessageId: id,
          subject,
          sender,
          status: "imported",
          detail: `${persisted.merchant ?? "Unknown merchant"} — ${persisted.currency} ${persisted.amount}`,
          receivedAt: receivedAt ?? undefined,
        });
      } catch (err) {
        records.push({
          gmailMessageId: id,
          subject,
          sender,
          status: "failed",
          stage: "persistence",
          detail: errorMessage(err),
          receivedAt: receivedAt ?? undefined,
        });
      }
    } catch (err) {
      records.push({
        gmailMessageId: id,
        subject: "(unknown)",
        sender: "(unknown)",
        status: "failed",
        stage: "other",
        detail: errorMessage(err),
      });
    }
  }

  // Derive every count from `records` rather than tracking counters in
  // parallel -- one source of truth means the summary numbers and the
  // detail table can never disagree.
  const imported = records.filter((r) => r.status === "imported").length;
  const skipped = records.filter((r) => r.status === "skipped").length;
  const ignored = records.filter((r) => r.status === "ignored").length;
  const failed = records.filter((r) => r.status === "failed").length;

  const failureBreakdown: Record<string, number> = {};
  for (const record of records) {
    if (record.status !== "failed" || !record.stage) continue;
    const key = stageLabel(record.stage);
    failureBreakdown[key] = (failureBreakdown[key] ?? 0) + 1;
  }

  return {
    processed: messageIds.length,
    imported,
    skipped,
    ignored,
    failed,
    durationMs: Date.now() - startedAt,
    dryRun,
    records,
    failureBreakdown,
  };
}
