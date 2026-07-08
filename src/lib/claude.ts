import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

function buildPrompt(emailText: string): string {
  return `Extract the transaction details from this bank email into a JSON object with these fields: merchant, amount, currency, transactionType, card (card name or last 4 digits if present), date, confidence (how sure you are, 0-1), and reasoning (a brief explanation of how you arrived at these values).

Respond with only the JSON object, no other text.

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
