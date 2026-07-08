-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('BOOKING', 'QUESTION');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "type" "BookingType" NOT NULL DEFAULT 'BOOKING';

-- CreateIndex
CREATE INDEX "bookings_type_idx" ON "bookings"("type");
