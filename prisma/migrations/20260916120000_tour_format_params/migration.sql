-- Длительность, размер группы и сложность переезжают с тура на формат тура:
-- у джипа группа до 4 человек, у автобуса — до 20. Ближайшая дата больше не
-- хранится вручную — её считают из заездов формата.

-- AlterTable: новые поля формата
ALTER TABLE "tour_price_options"
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "durationDays" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "groupSize" TEXT,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM';

-- Переносим данные: каждый формат получает параметры своего тура.
-- Размер группы: если у формата был свой максимум — берём его («до N чел.»),
-- иначе общий текст тура.
UPDATE "tour_price_options" AS o
SET
  "durationDays" = t."durationDays",
  "difficulty"   = t."difficulty",
  "groupSize"    = CASE
                     WHEN o."maxGroupSize" IS NOT NULL THEN 'до ' || o."maxGroupSize" || ' чел.'
                     ELSE t."groupSize"
                   END
FROM "tours" AS t
WHERE o."tourId" = t."id";

-- Порядок форматов раньше не хранился: фиксируем текущий — по возрастанию цены.
UPDATE "tour_price_options" AS o
SET "order" = ranked.rn
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "tourId" ORDER BY "priceFrom", "formatName") - 1 AS rn
  FROM "tour_price_options"
) AS ranked
WHERE o."id" = ranked."id";

-- AlterTable: старые поля больше не нужны
ALTER TABLE "tour_price_options" DROP COLUMN "maxGroupSize";

ALTER TABLE "tours"
DROP COLUMN "durationDays",
DROP COLUMN "groupSize",
DROP COLUMN "difficulty",
DROP COLUMN "nearestDate";
