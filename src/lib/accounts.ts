import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
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

// The single point of indirection for "what timestamp is the balance
// reconciliation baseline." Today that's balanceUpdatedAt (see the schema
// comment on Account.balanceUpdatedAt) -- if a dedicated `baselineAt`
// field is ever introduced, this is the only line that needs to change.
function getBaselineTimestamp(account: { balanceUpdatedAt: Date }): Date {
  return account.balanceUpdatedAt;
}

// The manually-entered currentBalance is a baseline snapshot, confirmed
// accurate as of getBaselineTimestamp(account) -- never derived from full
// transaction history. Transactions dated on/after that baseline adjust a
// *displayed* balance on top of it; transactions before it are historical
// only and never affect this figure.
async function getDisplayedBalance(account: {
  id: string;
  currentBalance: Prisma.Decimal;
  balanceUpdatedAt: Date;
}): Promise<number> {
  const baselineTimestamp = getBaselineTimestamp(account);
  // Truncated to the baseline's calendar day via Date.UTC, not
  // `new Date(y, m, d)` -- transactionDate is a bare @db.Date column (no
  // time-of-day), compared against the UTC calendar date of whatever bound
  // is supplied. The local Date constructor builds a local-midnight
  // instant, which on a server east of UTC (this one runs in
  // Asia/Singapore, UTC+8) lands on the *previous* UTC calendar day --
  // silently relaxing this bound backward by a day and letting the day
  // before the real baseline count as "on or after" it. Date.UTC(y, m, d)
  // pins the intended calendar date exactly, matching how transactionDate
  // is written elsewhere (new Date("YYYY-MM-DD"), parsed as UTC midnight).
  const baselineDate = new Date(
    Date.UTC(baselineTimestamp.getFullYear(), baselineTimestamp.getMonth(), baselineTimestamp.getDate()),
  );

  const rows = await prisma.transaction.groupBy({
    by: ["direction"],
    where: { accountId: account.id, transactionDate: { gte: baselineDate } },
    _sum: { amount: true },
  });
  const inSum = rows.find((r) => r.direction === "in")?._sum.amount?.toNumber() ?? 0;
  const outSum = rows.find((r) => r.direction === "out")?._sum.amount?.toNumber() ?? 0;

  return account.currentBalance.toNumber() + inSum - outSum;
}

export async function getAvailableCash(): Promise<number> {
  const accounts = await prisma.account.findMany({
    where: { includedInAvailableCash: true, isActive: true },
  });
  const balances = await Promise.all(accounts.map(getDisplayedBalance));
  return balances.reduce((sum, balance) => sum + balance, 0);
}

// Available Cash and (non-credit-card) Net Worth membership stay
// flag-driven (includedInAvailableCash / includedInNetWorth). Credit cards
// were never marked includedInNetWorth (no flag for "counts, but as a
// negative"), so their contribution is a new, explicit subtraction driven
// by `type` -- "credit_card" is the one liability type today, per
// LIABILITY_TYPES.
export async function getNetWorth(): Promise<number> {
  const [assetAccounts, liabilityAccounts] = await Promise.all([
    prisma.account.findMany({ where: { includedInNetWorth: true, isActive: true } }),
    prisma.account.findMany({
      where: { type: { in: Array.from(LIABILITY_TYPES) }, isActive: true },
    }),
  ]);
  const [assetBalances, liabilityBalances] = await Promise.all([
    Promise.all(assetAccounts.map(getDisplayedBalance)),
    Promise.all(liabilityAccounts.map(getDisplayedBalance)),
  ]);
  const assets = assetBalances.reduce((sum, balance) => sum + balance, 0);
  const liabilities = liabilityBalances.reduce((sum, balance) => sum + balance, 0);
  return assets - liabilities;
}

// Groups accounts by `type` into the three Net Worth breakdown sections
// (presentation only -- no account names or the includedInX flags are
// referenced here). Each section's `total` is already correctly signed,
// so getNetWorth() and this breakdown can never disagree: summing every
// group's `total` here equals getNetWorth()'s result exactly, because both
// derive from the same LIABILITY_TYPES signing rule (and the same
// getDisplayedBalance() figure per account).
export async function getNetWorthBreakdown(): Promise<NetWorthBreakdownGroup[]> {
  const rows = await prisma.account.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const balances = await Promise.all(rows.map(getDisplayedBalance));

  const bySection = new Map<
    string,
    { accounts: { id: string; name: string; balance: number }[]; total: number }
  >();

  rows.forEach((row, index) => {
    const label = SECTION_LABELS[row.type] ?? "Other";
    const balance = balances[index];
    const signed = LIABILITY_TYPES.has(row.type) ? -balance : balance;

    const section = bySection.get(label) ?? { accounts: [], total: 0 };
    section.accounts.push({ id: row.id, name: row.name, balance });
    section.total += signed;
    bySection.set(label, section);
  });

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

  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      balance: formatCurrency(await getDisplayedBalance(row), row.currency),
      updatedAt: formatRelativeDate(row.balanceUpdatedAt),
    })),
  );
}

// Resets the reconciliation baseline: the newly entered balance is
// confirmed accurate as of now, so balanceUpdatedAt moves to now and only
// transactions from this point forward will adjust the displayed balance
// going forward.
export async function updateAccountBalance(accountId: string, newBalance: number): Promise<void> {
  await prisma.account.update({
    where: { id: accountId },
    data: { currentBalance: newBalance, balanceUpdatedAt: new Date() },
  });
}
