-- CreateTable
CREATE TABLE "MerchandiseHowToConsume" (
    "id" SERIAL NOT NULL,
    "consumption" TEXT NOT NULL,
    "merchandiseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchandiseHowToConsume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchandiseHowToConsume_merchandiseId_key" ON "MerchandiseHowToConsume"("merchandiseId");

-- AddForeignKey
ALTER TABLE "MerchandiseHowToConsume" ADD CONSTRAINT "MerchandiseHowToConsume_merchandiseId_fkey" FOREIGN KEY ("merchandiseId") REFERENCES "Merchandise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
