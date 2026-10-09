-- Примечание «Что взять с собой» — у каждой категории своё.
ALTER TABLE "tours" ADD COLUMN "whatToTakeNotes" JSONB NOT NULL DEFAULT '{}';

-- Общее примечание тура переносим во все его категории: на сайте оно уже
-- показывалось под каждой.
UPDATE "tours" AS t
SET "whatToTakeNotes" = s.notes
FROM (
  SELECT c."tourId", jsonb_object_agg(c."categoryId", btrim(t2."whatToTakeNote")) AS notes
  FROM (
    SELECT DISTINCT l."tourId", i."categoryId"
    FROM "tour_what_to_take_links" l
    JOIN "what_to_take_items" i ON i."id" = l."itemId"
  ) c
  JOIN "tours" t2 ON t2."id" = c."tourId"
  WHERE btrim(coalesce(t2."whatToTakeNote", '')) <> ''
  GROUP BY c."tourId"
) s
WHERE t."id" = s."tourId";

ALTER TABLE "tours" DROP COLUMN "whatToTakeNote";
