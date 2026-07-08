"use server";

import { askClaudeToExtractTransaction } from "@/lib/claude";

export async function extractTransaction(
  emailText: string,
): Promise<{ prompt: string; responseText: string } | { error: string }> {
  try {
    return await askClaudeToExtractTransaction(emailText);
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
