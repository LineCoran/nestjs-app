-- Статьи блога: боковая панель (содержание, туры, кнопка) и автор — гид.
-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "sidebar" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE INDEX "blog_posts_authorId_idx" ON "blog_posts"("authorId");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "guides"("id") ON DELETE SET NULL ON UPDATE CASCADE;
