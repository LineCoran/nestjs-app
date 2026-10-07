-- AlterTable
ALTER TABLE "tours" ADD COLUMN "isNew" BOOLEAN NOT NULL DEFAULT false;

-- «Новинка» раньше задавалась бейджем — переносим в флаг и убираем из бейджей.
UPDATE "tours"
SET "isNew" = true,
    "badges" = ARRAY(SELECT b FROM unnest("badges") AS b WHERE lower(trim(b)) <> 'новинка')
WHERE EXISTS (SELECT 1 FROM unnest("badges") AS b WHERE lower(trim(b)) = 'новинка');
