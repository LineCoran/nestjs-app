-- Общих «для всех форматов» заездов больше нет: каждый такой заезд
-- копируется в каждый формат своего тура (на сайте он и так показывался
-- в каждом формате), заявки переезжают на копию своего формата, общие
-- заезды удаляются, а формат у заезда становится обязательным.

INSERT INTO "tour_sessions" ("id", "dateFrom", "dateTo", "availability", "tourId", "priceOptionId")
SELECT gen_random_uuid()::text, s."dateFrom", s."dateTo", s."availability", s."tourId", po."id"
FROM "tour_sessions" s
JOIN "tour_price_options" po ON po."tourId" = s."tourId"
WHERE s."priceOptionId" IS NULL;

UPDATE "bookings" b
SET "sessionId" = n."id"
FROM "tour_sessions" o
JOIN "tour_sessions" n
  ON n."tourId" = o."tourId"
 AND n."dateFrom" = o."dateFrom"
 AND n."dateTo" = o."dateTo"
 AND n."priceOptionId" IS NOT NULL
WHERE b."sessionId" = o."id"
  AND o."priceOptionId" IS NULL
  AND n."priceOptionId" = b."priceOptionId";

DELETE FROM "tour_sessions" WHERE "priceOptionId" IS NULL;

-- AlterTable
ALTER TABLE "tour_sessions" ALTER COLUMN "priceOptionId" SET NOT NULL;
