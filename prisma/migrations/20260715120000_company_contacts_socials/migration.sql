-- AlterTable
ALTER TABLE "company_info" ADD COLUMN     "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "region" TEXT,
ADD COLUMN     "registryNumber" TEXT,
ADD COLUMN     "socialLinks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "workingDays" TEXT,
ADD COLUMN     "workingHours" TEXT;
