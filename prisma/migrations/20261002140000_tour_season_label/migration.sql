-- Белый бейдж на карточке тура: свой текст вместо сезона («Лето», «с 2027 года»).
-- AlterTable
ALTER TABLE "tours" ADD COLUMN     "seasonLabel" TEXT;
