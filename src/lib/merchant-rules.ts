import { prisma } from "@/lib/db";

// v1: case-insensitive merchant substring match (bidirectional, same
// heuristic as commitment-matching.ts's merchantSubstringRule). First rule
// created wins on a multi-match, for deterministic behavior. Future rule
// types (MCC, keywords, bank-specific) can layer in here without changing
// this function's signature or the schema.
export async function matchCategoryForMerchant(merchant: string | null): Promise<string | null> {
  if (!merchant) return null;

  const rules = await prisma.merchantRule.findMany({ orderBy: { createdAt: "asc" } });
  const merchantLower = merchant.toLowerCase();

  const match = rules.find((rule) => {
    const pattern = rule.merchantPattern.toLowerCase();
    return merchantLower.includes(pattern) || pattern.includes(merchantLower);
  });

  return match?.categoryId ?? null;
}

export async function createMerchantRule(categoryId: string, merchantPattern: string): Promise<void> {
  await prisma.merchantRule.create({ data: { categoryId, merchantPattern } });
}
