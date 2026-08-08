-- AlterTable
ALTER TABLE "tours" ADD COLUMN     "earlyBooking" TEXT,
ADD COLUMN     "hidePrice" BOOLEAN NOT NULL DEFAULT false;
