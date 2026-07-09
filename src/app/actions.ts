"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getGmailAccessToken } from "@/lib/gmail-token";
import { runDailySync } from "@/lib/daily-sync";
import type { ImportSummary } from "@/lib/historical-import";

export async function runDailySyncAction(): Promise<ImportSummary | { error: string }> {
  const session = await auth();
  if (!session?.gmailConnected) {
    return { error: "Gmail isn't connected." };
  }

  const accessToken = await getGmailAccessToken();
  if (!accessToken) {
    return { error: "No Gmail access token found in the session." };
  }

  try {
    const summary = await runDailySync(accessToken);
    revalidatePath("/");
    return summary;
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
