/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `provider` on the `Customer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('local', 'kakao');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" "Provider" NOT NULL,
ALTER COLUMN "nickname" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "tagName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostingToTag" (
    "id" SERIAL NOT NULL,
    "tagId" INTEGER NOT NULL,
    "postingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostingToTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_provider_providerId_key" ON "Customer"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "PostingToTag" ADD CONSTRAINT "PostingToTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingToTag" ADD CONSTRAINT "PostingToTag_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "Posting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
