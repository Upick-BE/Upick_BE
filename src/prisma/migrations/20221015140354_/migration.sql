-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);
