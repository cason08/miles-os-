import { prisma } from "@/lib/db";

export type TransactionRowData = {
  id: string;
  merchant: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  account: string;
  amount: string;
  date: string;
  source: "imported" | "manual";
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  SGD: "S$",
};

function formatAmount(amountNumber: number, currency: string, direction: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const sign = direction === "in" ? "+" : "-";
  const value = amountNumber.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${symbol}${value}`;
}

// Reproduces the Dashboard V2 placeholder's date convention (Today /
// Yesterday / N days ago), falling back to a short absolute date beyond
// that window.
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 6) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}

// No Account/Card model yet -- bank name plus masked card digits when
// present is the honest stand-in (no hardcoded card-product names).
function formatAccount(bank: string, cardLastFour: string | null): string {
  return cardLastFour ? `${bank} •••• ${cardLastFour}` : bank;
}

export async function getTransactions(limit?: number): Promise<TransactionRowData[]> {
  const rows = await prisma.transaction.findMany({
    include: { category: true },
    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
  });

  return rows.map((row) => ({
    id: row.id,
    merchant: row.merchant ?? "Unknown merchant",
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    categoryColor: row.category?.color ?? null,
    account: formatAccount(row.bank, row.cardLastFour),
    amount: formatAmount(row.amount.toNumber(), row.currency, row.direction),
    date: formatRelativeDate(row.transactionDate),
    source: "imported" as const,
  }));
}

// Sets categorySource to "manual" whenever a category is assigned this way
// -- never null it out silently -- so a future rule re-run or AI
// categorisation can recognize and skip transactions the user categorised
// by hand. Clearing back to Uncategorized (categoryId: null) also clears
// categorySource, since there's no source for an unset category.
export async function setTransactionCategory(
  transactionId: string,
  categoryId: string | null,
): Promise<void> {
  await prisma.transaction.update({
    where: { id: transactionId },
    data: { categoryId, categorySource: categoryId ? "manual" : null },
  });
}
