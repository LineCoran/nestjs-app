-- Настройки баннеров главной страницы («Готовы увидеть Камчатку?», «Хотите подарить впечатления?»).
-- AlterTable
ALTER TABLE "company_info" ADD COLUMN     "banners" JSONB NOT NULL DEFAULT '{}';
