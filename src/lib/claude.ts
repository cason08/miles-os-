import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

function buildPrompt(emailText: string): string {
  return `You extract structured transaction data from bank transaction alert emails (DBS, OCBC, Citibank).

Return exactly one JSON object with this schema and nothing else:

{
  "bank": string,                 // one of: "DBS", "OCBC", "Citibank", "UOB"
  "merchant": string | null,      // merchant/payee name as it appears in the email, or null if not stated
  "amount": number,               // absolute transaction amount as a number -- no currency symbol, no thousands separator
  "currency": string,             // ISO 4217 currency code, e.g. "SGD", "USD"
  "transactionKind": string,      // one of: "purchase", "refund", "transfer", "withdrawal", "payment", "other"
  "cardLastFour": string | null,  // card name and/or last 4 digits exactly as they appear, or null if the email does not mention a card
  "date": string,                 // transaction date in ISO 8601 format: YYYY-MM-DD
  "confidence": number,           // your confidence in this extraction, between 0 and 1
  "reasoning": string             // one or two sentences on how you arrived at these values, referencing the specific email text you used
}

Rules:
- Output only the JSON object. No markdown code fences, no backticks, no preamble or commentary outside the "reasoning" field.
- Use null (not "N/A", not "unknown", not an empty string) for any field that cannot be determined from the email.
- "amount" must be a JSON number, not a string.
- "confidence" must be a JSON number between 0 and 1, not a percentage or string.
- If the email is not a transaction alert at all, set every field to null except "reasoning", which should explain why.

Email:
${emailText}`;
}

export async function askClaudeToExtractTransaction(
  emailText: string,
): Promise<{ prompt: string; responseText: string }> {
  const prompt = buildPrompt(emailText);

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return { prompt, responseText };
}
