-- Плашка характеристик под заголовком тура: до 5 пунктов, заполняются в админке.
-- AlterTable
ALTER TABLE "tours" ADD COLUMN     "highlights" JSONB NOT NULL DEFAULT '[]';
