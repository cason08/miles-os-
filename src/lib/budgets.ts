import { prisma } from "@/lib/db";

export type CategoryBudgetStatus = {
  id: string;
  name: string;
  color: string | null;
  budget: number;
  spent: number;
  percent: number;
  status: "on-track" | "warning" | "exceeded";
};

// Only categories with a budget set are meaningful here -- a category with
// no budget has nothing to compare spend against, so it simply doesn't
// produce a card (still fully visible/manageable on /categories).
export async function getCategoryBudgetStatuses(): Promise<CategoryBudgetStatus[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true, budget: { not: null } },
    orderBy: { name: "asc" },
  });
  if (categories.length === 0) return [];

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const spendByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      direction: "out",
      transactionDate: { gte: start, lt: end },
      categoryId: { in: categories.map((c) => c.id) },
    },
    _sum: { amount: true },
  });
  const spendMap = new Map(
    spendByCategory.map((s) => [s.categoryId, s._sum.amount?.toNumber() ?? 0]),
  );

  return categories.map((category) => {
    const budget = category.budget!.toNumber();
    const spent = spendMap.get(category.id) ?? 0;
    const percent = budget > 0 ? (spent / budget) * 100 : 0;
    const status: CategoryBudgetStatus["status"] =
      percent > 100 ? "exceeded" : percent >= 80 ? "warning" : "on-track";

    return { id: category.id, name: category.name, color: category.color, budget, spent, percent, status };
  });
}
