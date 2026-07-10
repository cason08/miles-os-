import { prisma } from "@/lib/db";
import { createManualTransaction } from "@/lib/persist-transaction";

export type TransactionRowData = {
  id: string;
  merchant: string;
  /** True underlying value (may be null) -- for edit-form prefill, not display. */
  merchantRaw: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  accountId: string | null;
  account: string;
  /** Pre-formatted, sign-and-currency included -- for display. */
  amount: string;
  /** Raw positive amount -- for edit-form prefill. */
  amountRaw: number;
  /** "in" | "out" -- for edit-form prefill (the Expense/Income toggle). */
  direction: string;
  /** Relative, e.g. "Today" -- for display. */
  date: string;
  /** ISO YYYY-MM-DD -- for edit-form prefill (the date input). */
  transactionDateRaw: string;
  source: "imported" | "manual";
};

export type TransactionInput = {
  merchant: string;
  amount: number;
  direction: string;
  accountId: string | null;
  categoryId: string | null;
  date: string;
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

// Prefers the linked Account's name (set via manual entry, or via editing
// a Gmail-imported row to assign one) over the raw bank string extracted
// from the email -- falls back to bank for legacy rows with no assigned
// account, so existing transactions display identically until assigned.
function formatAccountLabel(
  accountName: string | null,
  bank: string | null,
  cardLastFour: string | null,
): string {
  const name = accountName ?? bank ?? "Unassigned";
  return cardLastFour ? `${name} •••• ${cardLastFour}` : name;
}

export async function getTransactions(limit?: number): Promise<TransactionRowData[]> {
  const rows = await prisma.transaction.findMany({
    include: { category: true, account: true },
    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    ...(limit !== undefined ? { take: limit } : {}),
  });

  return rows.map((row) => ({
    id: row.id,
    merchant: row.merchant ?? "Unknown merchant",
    merchantRaw: row.merchant,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
    categoryColor: row.category?.color ?? null,
    accountId: row.accountId,
    account: formatAccountLabel(row.account?.name ?? null, row.bank, row.cardLastFour),
    amount: formatAmount(row.amount.toNumber(), row.currency, row.direction),
    amountRaw: row.amount.toNumber(),
    direction: row.direction,
    date: formatRelativeDate(row.transactionDate),
    transactionDateRaw: row.transactionDate.toISOString().slice(0, 10),
    source: row.source === "manual" ? "manual" : "imported",
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

// Manual entries default to "purchase"/"deposit" -- transactionKind isn't
// an editable field (not in the Transaction CRUD field list) and nothing
// reads it for any live calculation; it's informational only.
export async function createTransaction(input: TransactionInput): Promise<void> {
  await createManualTransaction({
    merchant: input.merchant,
    amount: input.amount,
    currency: "SGD",
    transactionKind: input.direction === "out" ? "purchase" : "deposit",
    direction: input.direction,
    date: input.date,
    accountId: input.accountId,
    categoryId: input.categoryId,
    categorySource: input.categoryId ? "manual" : null,
  });
}

// Touches only the financial fields the Transaction CRUD feature exposes
// for editing -- gmailMessageId, gmailThreadId, gmailReceivedAt, source,
// bank, cardLastFour, and transactionKind are deliberately absent from
// this update, so a Gmail-imported row's email audit trail is never
// touched by an edit. Same categorySource invariant as
// setTransactionCategory(): "manual" whenever a category is chosen here,
// null when cleared back to Uncategorized -- a manual edit always wins
// over rule-based categorisation.
export async function updateTransaction(id: string, input: TransactionInput): Promise<void> {
  await prisma.transaction.update({
    where: { id },
    data: {
      merchant: input.merchant,
      amount: input.amount,
      direction: input.direction,
      transactionDate: new Date(input.date),
      accountId: input.accountId,
      categoryId: input.categoryId,
      categorySource: input.categoryId ? "manual" : null,
    },
  });
}

// Hard delete, per the "no soft deletes" design philosophy -- removes only
// the Transaction row. Gmail metadata lives entirely outside this database
// (in the user's actual mailbox), so this can never touch it. Note: this
// does remove the row's dedup protection, so an explicit later re-run of
// Historical Import over the same date range would re-import it -- an
// accepted consequence of "no soft deletes," not something this guards
// against.
export async function deleteTransaction(id: string): Promise<void> {
  await prisma.transaction.delete({ where: { id } });
}
