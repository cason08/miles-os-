"use server";

import { askClaudeToExtractTransaction } from "@/lib/claude";
import { parseTransaction, type TransactionValidationResult } from "@/lib/transaction";

export type ExtractResult =
  | { prompt: string; responseText: string; validation: TransactionValidationResult }
  | { error: string };

export async function extractTransaction(emailText: string): Promise<ExtractResult> {
  try {
    const { prompt, responseText } = await askClaudeToExtractTransaction(emailText);
    const validation = parseTransaction(responseText);
    return { prompt, responseText, validation };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
