-- AlterEnum
ALTER TYPE "BookingType" ADD VALUE 'GIFT_CERTIFICATE';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "certificateAmount" INTEGER;
