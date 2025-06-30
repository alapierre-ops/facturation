-- Migration to add tax system and rename columns
-- Step 1: Add new columns with default values
ALTER TABLE "User" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'FRANCE';
ALTER TABLE "Client" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'FRANCE';

-- Step 2: Add new columns to Quotes table
ALTER TABLE "Quotes" ADD COLUMN "subtotal" DOUBLE PRECISION;
ALTER TABLE "Quotes" ADD COLUMN "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Quotes" ADD COLUMN "total" DOUBLE PRECISION;
ALTER TABLE "Quotes" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'FRANCE';
ALTER TABLE "Quotes" ADD COLUMN "taxRate" TEXT NOT NULL DEFAULT 'STANDARD';

-- Step 3: Add new columns to LineQuote table
ALTER TABLE "LineQuote" ADD COLUMN "subtotal" DOUBLE PRECISION;
ALTER TABLE "LineQuote" ADD COLUMN "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "LineQuote" ADD COLUMN "total" DOUBLE PRECISION;

-- Step 4: Add new columns to Invoice table
ALTER TABLE "Invoice" ADD COLUMN "subtotal" DOUBLE PRECISION;
ALTER TABLE "Invoice" ADD COLUMN "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN "total" DOUBLE PRECISION;
ALTER TABLE "Invoice" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'FRANCE';
ALTER TABLE "Invoice" ADD COLUMN "taxRate" TEXT NOT NULL DEFAULT 'STANDARD';

-- Step 5: Add new columns to LineInvoice table
ALTER TABLE "LineInvoice" ADD COLUMN "subtotal" DOUBLE PRECISION;
ALTER TABLE "LineInvoice" ADD COLUMN "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "LineInvoice" ADD COLUMN "total" DOUBLE PRECISION;

-- Step 6: Migrate existing data
UPDATE "Quotes" SET 
  "subtotal" = "totalHT",
  "total" = "totalTTC",
  "taxAmount" = "totalTTC" - "totalHT";

UPDATE "LineQuote" SET 
  "subtotal" = "totalHT",
  "total" = "totalTTC",
  "taxAmount" = "totalTTC" - "totalHT";

UPDATE "Invoice" SET 
  "subtotal" = "totalHT",
  "total" = "totalTTC",
  "taxAmount" = "totalTTC" - "totalHT";

UPDATE "LineInvoice" SET 
  "subtotal" = "totalHT",
  "total" = "totalTTC",
  "taxAmount" = "totalTTC" - "totalHT";

-- Step 7: Make new columns required
ALTER TABLE "Quotes" ALTER COLUMN "subtotal" SET NOT NULL;
ALTER TABLE "Quotes" ALTER COLUMN "total" SET NOT NULL;
ALTER TABLE "LineQuote" ALTER COLUMN "subtotal" SET NOT NULL;
ALTER TABLE "LineQuote" ALTER COLUMN "total" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "subtotal" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "total" SET NOT NULL;
ALTER TABLE "LineInvoice" ALTER COLUMN "subtotal" SET NOT NULL;
ALTER TABLE "LineInvoice" ALTER COLUMN "total" SET NOT NULL;

-- Step 8: Drop old columns
ALTER TABLE "Quotes" DROP COLUMN "totalHT";
ALTER TABLE "Quotes" DROP COLUMN "totalTTC";
ALTER TABLE "LineQuote" DROP COLUMN "totalHT";
ALTER TABLE "LineQuote" DROP COLUMN "totalTTC";
ALTER TABLE "Invoice" DROP COLUMN "totalHT";
ALTER TABLE "Invoice" DROP COLUMN "totalTTC";
ALTER TABLE "LineInvoice" DROP COLUMN "totalHT";
ALTER TABLE "LineInvoice" DROP COLUMN "totalTTC"; 