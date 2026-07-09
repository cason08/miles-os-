import { z } from "zod";
import { prisma } from "@/lib/db";
import { formatRelativeDate } from "@/lib/transactions";

// Extending later (e.g. "cpf", "property", "liability") is a one-line
// addition here -- no migration, since `type` is a plain string column.
export const AccountType = z.enum(["cash", "cash_equivalent", "investment", "credit_card"]);

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  cash_equivalent: "Cash Equivalent",
  investment: "Investments",
  credit_card: "Credit Cards",
};

export type AccountRowData = {
  id: string;
  name: string;
  type: string;
  balance: string;
  updatedAt: string;
};

// Presentation grouping for the Net Worth breakdown, driven entirely by
// `type` (not account name, not the includedInX flags) so a future account
// is automatically placed correctly just by setting its type.
const SECTION_LABELS: Record<string, string> = {
  cash: "Available Cash",
  cash_equivalent: "Available Cash",
  investment: "Investments",
  credit_card: "Credit Cards",
};
const SECTION_ORDER = ["Available Cash", "Investments", "Credit Cards"];

// Only "credit_card" is a liability type today -- a future liability type
// (e.g. a mortgage) is a one-line addition here. This is the one place
// that decides sign; both getNetWorth() and getNetWorthBreakdown() derive
// from it, so they can't disagree.
const LIABILITY_TYPES = new Set<string>(["credit_card"]);

export type NetWorthBreakdownGroup = {
  label: string;
  accounts: { id: string; name: string; balance: number }[];
  /** Already correctly signed -- negative for the Credit Cards (liability) group. */
  total: number;
};

function formatCurrency(amountNumber: number, currency: string): string {
  const symbol = currency === "SGD" ? "S$" : `${currency} `;
  const sign = amountNumber < 0 ? "-" : "";
  const value = Math.abs(amountNumber).toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${symbol}${value}`;
}

export async function getAvailableCash(): Promise<number> {
  const result = await prisma.account.aggregate({
    where: { includedInAvailableCash: true, isActive: true },
    _sum: { currentBalance: true },
  });
  return result._sum.currentBalance?.toNumber() ?? 0;
}

// Available Cash and (non-credit-card) Net Worth membership stay
// flag-driven (includedInAvailableCash / includedInNetWorth), unchanged
// from when the Account model shipped. Credit cards were never marked
// includedInNetWorth (no flag for "counts, but as a negative"), so their
// contribution is a new, explicit subtraction driven by `type` --
// "credit_card" is the one liability type today, per LIABILITY_TYPES.
export async function getNetWorth(): Promise<number> {
  const [assetResult, liabilityResult] = await Promise.all([
    prisma.account.aggregate({
      where: { includedInNetWorth: true, isActive: true },
      _sum: { currentBalance: true },
    }),
    prisma.account.aggregate({
      where: { type: { in: Array.from(LIABILITY_TYPES) }, isActive: true },
      _sum: { currentBalance: true },
    }),
  ]);
  const assets = assetResult._sum.currentBalance?.toNumber() ?? 0;
  const liabilities = liabilityResult._sum.currentBalance?.toNumber() ?? 0;
  return assets - liabilities;
}

// Groups accounts by `type` into the three Net Worth breakdown sections
// (presentation only -- no account names or the includedInX flags are
// referenced here). Each section's `total` is already correctly signed,
// so getNetWorth() and this breakdown can never disagree: summing every
// group's `total` here equals getNetWorth()'s result exactly, because
// both derive from the same LIABILITY_TYPES signing rule.
export async function getNetWorthBreakdown(): Promise<NetWorthBreakdownGroup[]> {
  const rows = await prisma.account.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const bySection = new Map<
    string,
    { accounts: { id: string; name: string; balance: number }[]; total: number }
  >();

  for (const row of rows) {
    const label = SECTION_LABELS[row.type] ?? "Other";
    const balance = row.currentBalance.toNumber();
    const signed = LIABILITY_TYPES.has(row.type) ? -balance : balance;

    const section = bySection.get(label) ?? { accounts: [], total: 0 };
    section.accounts.push({ id: row.id, name: row.name, balance });
    section.total += signed;
    bySection.set(label, section);
  }

  return SECTION_ORDER.filter((label) => bySection.has(label)).map((label) => ({
    label,
    ...bySection.get(label)!,
  }));
}

export async function getAccounts(): Promise<AccountRowData[]> {
  const rows = await prisma.account.findMany({
    where: { isActive: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    balance: formatCurrency(row.currentBalance.toNumber(), row.currency),
    updatedAt: formatRelativeDate(row.balanceUpdatedAt),
  }));
}

export async function updateAccountBalance(accountId: string, newBalance: number): Promise<void> {
  await prisma.account.update({
    where: { id: accountId },
    data: { currentBalance: newBalance, balanceUpdatedAt: new Date() },
  });
}
