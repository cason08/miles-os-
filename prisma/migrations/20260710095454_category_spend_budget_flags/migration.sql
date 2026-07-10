-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "countsTowardsBudget" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "countsTowardsSpent" BOOLEAN NOT NULL DEFAULT true;
