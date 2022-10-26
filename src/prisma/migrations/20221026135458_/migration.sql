/*
  Warnings:

  - Added the required column `rating` to the `Merchandise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Merchandise" DROP CONSTRAINT "Merchandise_companyId_fkey";

-- AlterTable
ALTER TABLE "Merchandise" ADD COLUMN     "rating" INTEGER NOT NULL,
ALTER COLUMN "companyId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MerchandiseComment" (
    "id" SERIAL NOT NULL,
    "pharmacistId" INTEGER NOT NULL,
    "merchandiseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchandiseComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Merchandise" ADD CONSTRAINT "Merchandise_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchandiseComment" ADD CONSTRAINT "MerchandiseComment_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "Pharmacist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchandiseComment" ADD CONSTRAINT "MerchandiseComment_merchandiseId_fkey" FOREIGN KEY ("merchandiseId") REFERENCES "Merchandise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
