-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "cardLastFour" TEXT;

-- CreateTable
CREATE TABLE "MonthlyCommitment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expectedAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "expectedDayOfMonth" INTEGER NOT NULL,
    "dayTolerance" INTEGER NOT NULL DEFAULT 3,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyCommitment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MonthlyCommitment" ADD CONSTRAINT "MonthlyCommitment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
