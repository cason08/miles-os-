import { prisma } from "@/lib/db";
import { runHistoricalImport, type ImportSummary } from "@/lib/historical-import";
import { determineSyncCheckpoint, recordProcessedCheckpoint } from "@/lib/import-checkpoint";

// The day-to-day entry point: resume from wherever the last import (of
// either kind) left off, then defer entirely to the shared engine.
export async function runDailySync(accessToken: string): Promise<ImportSummary> {
  const since = await determineSyncCheckpoint();
  const summary = await runHistoricalImport(accessToken, since);
  await recordProcessedCheckpoint(summary);
  await recordSyncCompleted();
  return summary;
}

// Purely product/UX metadata ("last time the user successfully ran Sync")
// -- deliberately separate from the checkpoint the importer uses, and only
// ever written here, never from Historical Import.
export async function recordSyncCompleted(): Promise<void> {
  await prisma.appState.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", lastSyncedAt: new Date() },
    update: { lastSyncedAt: new Date() },
  });
}

export async function getLastSyncedAt(): Promise<Date | null> {
  const state = await prisma.appState.findUnique({ where: { id: "singleton" } });
  return state?.lastSyncedAt ?? null;
}
