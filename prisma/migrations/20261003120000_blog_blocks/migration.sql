-- Статьи блога: тело из блоков, вводный абзац и подпись под обложкой.
-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "blocks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "coverCaption" TEXT,
ADD COLUMN     "lead" TEXT;

-- Старый HTML-текст переносим в один текстовый блок, чтобы его можно было править в новом редакторе.
UPDATE "blog_posts"
SET "blocks" = jsonb_build_array(
  jsonb_build_object('id', 'legacy-text', 'type', 'text', 'html', "content")
)
WHERE "content" IS NOT NULL AND btrim("content") <> '';
