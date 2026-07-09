import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

function buildPrompt(emailText: string, receivedAtDate: string | null): string {
  const metadataSection = receivedAtDate
    ? `Email metadata:\nGmail received date (YYYY-MM-DD): ${receivedAtDate}\n\n`
    : "";

  return `You extract structured transaction data from bank transaction alert emails (DBS, OCBC, Citibank).

${metadataSection}Return exactly one JSON object with this schema and nothing else:

{
  "bank": string,                 // one of: "DBS", "OCBC", "Citibank", "UOB"
  "merchant": string | null,      // merchant/payee name as it appears in the email, or null if not stated
  "amount": number,               // absolute transaction amount as a number -- no currency symbol, no thousands separator
  "currency": string,             // ISO 4217 currency code, e.g. "SGD", "USD"
  "transactionKind": string,      // one of: "purchase", "refund", "transfer", "withdrawal", "payment", "other"
  "direction": string,            // one of: "in", "out" -- whether money moved into ("in") or out of ("out") the user's account
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
- For "date": prefer a full calendar date stated explicitly in the email body. Only use the Gmail received date above if the body itself does not state a calendar date (e.g. it only gives a time like "12:25 PM" with no date).
- For "direction": a card purchase is "out"; a PayNow transfer sent is "out"; a deposit received is "in"; a salary credit is "in"; a refund is "in".
- A financial transaction is an actual completed movement of money into or out of a bank account or payment card. If the email is not reporting a financial transaction, set every field to null except "reasoning", which should explain why. This includes bank administrative or notification emails that are not themselves transactions, e.g.: contact or email details updated, reward/miles points transferred between programs (a points movement, not a money movement), e-statement availability notices, security or login alerts, threshold or limit changes, and similar account-maintenance notices.

Email:
${emailText}`;
}

export async function askClaudeToExtractTransaction(
  emailText: string,
  receivedAtDate: string | null,
): Promise<{ prompt: string; responseText: string }> {
  const prompt = buildPrompt(emailText, receivedAtDate);

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
