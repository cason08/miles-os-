import { prisma } from "@/lib/db";
import type { ImportSummary } from "@/lib/historical-import";

const FALLBACK_WINDOW_DAYS = 7;

// Shared by both import entry points (Historical Import and Daily Sync) --
// neither owns this checkpoint; it reflects "the newest Gmail message any
// import run has looked at," regardless of which tool did the looking.
export async function determineSyncCheckpoint(): Promise<Date> {
  const state = await prisma.appState.findUnique({ where: { id: "singleton" } });
  if (state?.lastProcessedGmailReceivedAt) return state.lastProcessedGmailReceivedAt;

  // Transition fallback: real transactions may already exist from before
  // this checkpoint was tracked. Once the first sync runs, AppState takes
  // over permanently.
  const newestTransaction = await prisma.transaction.findFirst({
    orderBy: { gmailReceivedAt: "desc" },
  });
  if (newestTransaction) return newestTransaction.gmailReceivedAt;

  // True cold start (no AppState row, no Transaction rows at all) -- Daily
  // Sync must still work rather than requiring Historical Import first.
  const fallback = new Date();
  fallback.setDate(fallback.getDate() - FALLBACK_WINDOW_DAYS);
  return fallback;
}

// Advances the checkpoint to the newest gmailReceivedAt among ALL records
// an import run processed -- imported, ignored, or failed past the fetch
// stage -- not just successfully imported ones. Without this, ignored/
// failed emails (which never get a Transaction row) would be re-fetched
// and re-sent to Claude on every subsequent sync, since the existing
// gmailMessageId dedup only recognizes rows already in the Transaction
// table. Monotonic: never regresses, since Historical Import can
// legitimately be re-run for an older range after Daily Sync has already
// moved the checkpoint forward.
export async function recordProcessedCheckpoint(summary: ImportSummary): Promise<void> {
  const newest = summary.records
    .map((r) => r.receivedAt)
    .filter((d): d is Date => d != null)
    .reduce((max, d) => (d > max ? d : max), new Date(0));
  if (newest.getTime() === 0) return;

  // Compared against the full effective checkpoint (AppState, else newest
  // Transaction, else the cold-start fallback) -- not just the raw AppState
  // column -- so the very first call ever made can't set an initial
  // checkpoint older than transactions that already exist.
  const currentCheckpoint = await determineSyncCheckpoint();
  if (newest <= currentCheckpoint) return;

  await prisma.appState.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", lastProcessedGmailReceivedAt: newest },
    update: { lastProcessedGmailReceivedAt: newest },
  });
}
