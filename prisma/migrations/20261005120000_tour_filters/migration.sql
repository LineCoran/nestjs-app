-- CreateEnum
CREATE TYPE "Transport" AS ENUM ('JEEP', 'SHIFT_BUS', 'SNOWMOBILE', 'HELICOPTER', 'BOAT', 'CAR');

-- AlterTable
ALTER TABLE "tours" ADD COLUMN "seasonMonths" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "tour_price_options" ADD COLUMN "transport" "Transport";
