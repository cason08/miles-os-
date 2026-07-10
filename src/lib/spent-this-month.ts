import { prisma } from "@/lib/db";

export async function getSpentThisMonth(): Promise<number> {
  const now = new Date();
  // Date.UTC, not `new Date(y, m, d)` -- the latter is a LOCAL midnight
  // instant, which on a server east of UTC (this one runs in
  // Asia/Singapore, UTC+8) lands on the *previous* UTC calendar day.
  // transactionDate is a bare @db.Date column (no time-of-day), compared
  // against the UTC calendar date of whatever bound is supplied -- a
  // locally-constructed bound silently shifts the whole month boundary
  // back by a day (excluding the month's last day, including the previous
  // month's last day). Date.UTC(y, m, d) pins the intended calendar date
  // exactly, matching how transactionDate is written elsewhere
  // (new Date("YYYY-MM-DD"), parsed as UTC midnight per spec).
  const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));

  const result = await prisma.transaction.aggregate({
    where: {
      direction: "out",
      transactionDate: { gte: startOfMonth, lt: startOfNextMonth },
    },
    _sum: { amount: true },
  });

  return result._sum.amount?.toNumber() ?? 0;
}
