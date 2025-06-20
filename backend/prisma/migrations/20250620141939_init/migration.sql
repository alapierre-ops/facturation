/*
  Warnings:

  - You are about to drop the `LineQuotes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LineQuotes" DROP CONSTRAINT "LineQuotes_quoteId_fkey";

-- DropTable
DROP TABLE "LineQuotes";

-- CreateTable
CREATE TABLE "LineQuote" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalHT" DOUBLE PRECISION NOT NULL,
    "totalTTC" DOUBLE PRECISION NOT NULL,
    "quoteId" INTEGER NOT NULL,

    CONSTRAINT "LineQuote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LineQuote" ADD CONSTRAINT "LineQuote_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
