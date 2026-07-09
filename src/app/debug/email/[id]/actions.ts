"use server";

import { askClaudeToExtractTransaction } from "@/lib/claude";
import { parseTransaction, type TransactionValidationResult } from "@/lib/transaction";
import { persistTransaction, type PersistedTransaction } from "@/lib/persist-transaction";

export type ExtractResult =
  | {
      prompt: string;
      responseText: string;
      validation: TransactionValidationResult;
      persisted: PersistedTransaction | null;
    }
  | { error: string };

export async function extractTransaction(
  emailText: string,
  receivedAtDate: string | null,
  gmailMessageId: string,
  gmailThreadId: string,
  gmailReceivedAtIso: string | null,
): Promise<ExtractResult> {
  try {
    const { prompt, responseText } = await askClaudeToExtractTransaction(
      emailText,
      receivedAtDate,
    );
    const validation = parseTransaction(responseText);

    const persisted = validation.success
      ? await persistTransaction(validation.transaction, {
          messageId: gmailMessageId,
          threadId: gmailThreadId,
          receivedAtIso: gmailReceivedAtIso,
        })
      : null;

    return { prompt, responseText, validation, persisted };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
