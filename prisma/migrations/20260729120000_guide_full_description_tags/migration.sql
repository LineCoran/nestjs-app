-- AlterTable
ALTER TABLE "guides" ADD COLUMN     "fullDescription" TEXT,
ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '[]';
