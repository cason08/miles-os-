import { prisma } from "@/lib/db";

export type CategoryData = {
  id: string;
  name: string;
  budget: number | null;
  currency: string;
  color: string | null;
};

export type CategoryInput = {
  name: string;
  budget: number | null;
  currency: string;
  color: string | null;
};

export async function getCategories(): Promise<CategoryData[]> {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    budget: row.budget?.toNumber() ?? null,
    currency: row.currency,
    color: row.color,
  }));
}

export async function createCategory(input: CategoryInput): Promise<void> {
  await prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  await prisma.category.update({ where: { id }, data: input });
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<void> {
  await prisma.category.update({ where: { id }, data: { isActive } });
}

// Safe now that Transaction.categoryId is onDelete: SetNull and
// MerchantRule.categoryId is onDelete: Cascade -- deleting a category never
// deletes or blocks deletion of transaction history. Clears categorySource
// on affected transactions first -- the SetNull cascade only touches
// categoryId, and a stale non-null categorySource next to a null categoryId
// would violate the "source is set iff a category is set" invariant.
export async function deleteCategory(id: string): Promise<void> {
  await prisma.$transaction([
    prisma.transaction.updateMany({ where: { categoryId: id }, data: { categorySource: null } }),
    prisma.category.delete({ where: { id } }),
  ]);
}
