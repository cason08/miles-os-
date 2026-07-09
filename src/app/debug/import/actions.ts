"use server";

import { auth } from "@/lib/auth";
import { getGmailAccessToken } from "@/lib/gmail-token";
import { runHistoricalImport, type ImportSummary } from "@/lib/historical-import";
import { recordProcessedCheckpoint } from "@/lib/import-checkpoint";

const DEFAULT_IMPORT_SINCE = new Date("2026-07-01T00:00:00Z");

export async function runImport(dryRun: boolean): Promise<ImportSummary | { error: string }> {
  const session = await auth();
  if (!session?.gmailConnected) {
    return { error: "Gmail isn't connected." };
  }

  const accessToken = await getGmailAccessToken();
  if (!accessToken) {
    return { error: "No Gmail access token found in the session." };
  }

  try {
    const summary = await runHistoricalImport(accessToken, DEFAULT_IMPORT_SINCE, { dryRun });
    // Keeps Daily Sync's checkpoint current even when a manual backfill is
    // what most recently touched Gmail -- so it doesn't re-walk ground this
    // run already covered. Dry runs never fetch real messages, so they have
    // no receivedAt data and this is a no-op for them.
    if (!dryRun) await recordProcessedCheckpoint(summary);
    return summary;
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
