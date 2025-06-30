-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "chargeRate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "maxAnnualTurnover" DOUBLE PRECISION,
ADD COLUMN     "phoneNumber" TEXT;
