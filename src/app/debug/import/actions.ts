"use server";

import { auth } from "@/lib/auth";
import { getGmailAccessToken } from "@/lib/gmail-token";
import { runHistoricalImport, type ImportSummary } from "@/lib/historical-import";

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
    return await runHistoricalImport(accessToken, DEFAULT_IMPORT_SINCE, { dryRun });
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
