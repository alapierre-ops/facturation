-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentType" TEXT;

-- AlterTable
ALTER TABLE "Quotes" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentType" TEXT;
