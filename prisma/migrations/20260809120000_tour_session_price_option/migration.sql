-- AlterTable
ALTER TABLE "tour_sessions" ADD COLUMN     "priceOptionId" TEXT;

-- CreateIndex
CREATE INDEX "tour_sessions_priceOptionId_idx" ON "tour_sessions"("priceOptionId");

-- AddForeignKey
ALTER TABLE "tour_sessions" ADD CONSTRAINT "tour_sessions_priceOptionId_fkey" FOREIGN KEY ("priceOptionId") REFERENCES "tour_price_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
