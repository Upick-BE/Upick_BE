/*
  Warnings:

  - You are about to drop the column `nickName` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `nickName` on the `Pharmacist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Pharmacist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nickname` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `Pharmacist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "nickName",
ADD COLUMN     "nickname" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pharmacist" DROP COLUMN "nickName",
ADD COLUMN     "userName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacist_email_key" ON "Pharmacist"("email");
