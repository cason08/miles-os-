import { prisma } from "@/lib/db";
import {
  fetchMessageIdsSince,
  fetchMessageFull,
  findBodyPart,
  htmlToReadableText,
  SUPPORTED_BANK_SENDERS,
} from "@/lib/gmail";
import { askClaudeToExtractTransaction } from "@/lib/claude";
import { parseTransaction } from "@/lib/transaction";
import { persistTransaction } from "@/lib/persist-transaction";

export type ImportSummary = {
  processed: number;
  /** Or "would be imported" when dryRun is true. */
  imported: number;
  skipped: number;
  /** Always 0 in dry-run mode -- nothing is attempted that can fail. */
  failed: number;
  durationMs: number;
  dryRun: boolean;
};

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
  let failed = 0;

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

      const message = await fetchMessageFull(accessToken, id);
      const plainText = findBodyPart(message.payload, "text/plain");
      const html = findBodyPart(message.payload, "text/html");
      const emailText = plainText ?? (html ? htmlToReadableText(html) : null);
      if (!emailText) {
        failed++;
        continue;
      }

      const receivedAt = message.internalDate ? new Date(Number(message.internalDate)) : null;
      const receivedAtDate = receivedAt ? receivedAt.toISOString().slice(0, 10) : null;
      const gmailReceivedAtIso = receivedAt ? receivedAt.toISOString() : null;

      const { responseText } = await askClaudeToExtractTransaction(emailText, receivedAtDate);
      const validation = parseTransaction(responseText);
      if (!validation.success) {
        failed++;
        continue;
      }

      await persistTransaction(validation.transaction, {
        messageId: id,
        threadId: message.threadId,
        receivedAtIso: gmailReceivedAtIso,
      });
      imported++;
    } catch {
      failed++;
    }
  }

  return {
    processed: messageIds.length,
    imported,
    skipped,
    failed,
    durationMs: Date.now() - startedAt,
    dryRun,
  };
}
