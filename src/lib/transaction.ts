import { z } from "zod";

export const TransactionSchema = z.object({
  bank: z.enum(["DBS", "OCBC", "Citibank"]),
  merchant: z.string().nullable(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  transactionKind: z.enum([
    "purchase",
    "refund",
    "transfer",
    "withdrawal",
    "payment",
    "other",
  ]),
  cardLastFour: z.string().nullable(),
  date: z.iso.date(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export type TransactionValidationResult =
  | { success: true; transaction: Transaction }
  | { success: false; errors: string[] };

// Claude is instructed to return only a raw JSON object, but this is the
// boundary between an AI response and typed code -- tolerate the model
// wrapping the object in a markdown code fence or surrounding prose rather
// than assuming the response is always directly parsable JSON.
function extractJsonObject(text: string): string {
  const trimmed = text.trim();

  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  const withoutFences = fenceMatch ? fenceMatch[1] : trimmed;

  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    return withoutFences;
  }
  return withoutFences.slice(start, end + 1);
}

export function parseTransaction(responseText: string): TransactionValidationResult {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJsonObject(responseText));
  } catch (err) {
    return {
      success: false,
      errors: [`Response is not valid JSON: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  const result = TransactionSchema.safeParse(parsedJson);
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    return { success: false, errors };
  }

  return { success: true, transaction: result.data };
}
