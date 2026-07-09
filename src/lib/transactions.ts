import { prisma } from "@/lib/db";

export type TransactionRowData = {
  id: string;
  merchant: string;
  category: string;
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
    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
  });

  return rows.map((row) => ({
    id: row.id,
    merchant: row.merchant ?? "Unknown merchant",
    // transactionKind (purchase/refund/transfer/...) is a different concept
    // from a spending category -- displaying it as one would be misleading.
    // Stays "Uncategorized" until real categorization exists.
    category: "Uncategorized",
    account: formatAccount(row.bank, row.cardLastFour),
    amount: formatAmount(row.amount.toNumber(), row.currency, row.direction),
    date: formatRelativeDate(row.transactionDate),
    source: "imported" as const,
  }));
}
