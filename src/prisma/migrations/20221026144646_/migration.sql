/*
  Warnings:

  - Made the column `companyId` on table `Merchandise` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Merchandise" DROP CONSTRAINT "Merchandise_companyId_fkey";

-- AlterTable
ALTER TABLE "Merchandise" ALTER COLUMN "companyId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Merchandise" ADD CONSTRAINT "Merchandise_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
