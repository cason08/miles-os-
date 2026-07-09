import { prisma } from "@/lib/db";

export async function getSpentThisMonth(): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const result = await prisma.transaction.aggregate({
    where: {
      direction: "out",
      transactionDate: { gte: startOfMonth, lt: startOfNextMonth },
    },
    _sum: { amount: true },
  });

  return result._sum.amount?.toNumber() ?? 0;
}
