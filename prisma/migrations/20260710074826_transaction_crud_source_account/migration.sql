-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'gmail',
ALTER COLUMN "gmailMessageId" DROP NOT NULL,
ALTER COLUMN "gmailThreadId" DROP NOT NULL,
ALTER COLUMN "gmailReceivedAt" DROP NOT NULL,
ALTER COLUMN "bank" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
