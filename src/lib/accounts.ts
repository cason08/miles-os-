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

export async function getNetWorth(): Promise<number> {
  const result = await prisma.account.aggregate({
    where: { includedInNetWorth: true, isActive: true },
    _sum: { currentBalance: true },
  });
  return result._sum.currentBalance?.toNumber() ?? 0;
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
