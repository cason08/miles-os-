-- DropForeignKey
ALTER TABLE "MerchantRule" DROP CONSTRAINT "MerchantRule_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "MerchantRule" ADD CONSTRAINT "MerchantRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
