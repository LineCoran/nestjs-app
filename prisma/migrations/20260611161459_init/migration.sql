-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "DateAvailability" AS ENUM ('AVAILABLE', 'LIMITED', 'FULL');

-- CreateEnum
CREATE TYPE "InclusionType" AS ENUM ('INCLUDED', 'EXCLUDED');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('TOUR_PAGE', 'HOMEPAGE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'REJECTED');

-- CreateEnum
CREATE TYPE "ImportantInfoType" AS ENUM ('INFO', 'WARNING', 'SUCCESS');

-- CreateTable
CREATE TABLE "tours" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "durationDays" INTEGER NOT NULL,
    "groupSize" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "season" TEXT,
    "nearestDate" TIMESTAMP(3),
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aboutText" TEXT,
    "categoryId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_program_items" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tourId" TEXT NOT NULL,

    CONSTRAINT "tour_program_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_price_options" (
    "id" TEXT NOT NULL,
    "formatName" TEXT NOT NULL,
    "priceFrom" INTEGER NOT NULL,
    "maxGroupSize" INTEGER,
    "tourId" TEXT NOT NULL,

    CONSTRAINT "tour_price_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_sessions" (
    "id" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "availability" "DateAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "tourId" TEXT NOT NULL,

    CONSTRAINT "tour_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_important_info" (
    "id" TEXT NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ImportantInfoType" NOT NULL DEFAULT 'INFO',
    "order" INTEGER NOT NULL DEFAULT 0,
    "tourId" TEXT NOT NULL,

    CONSTRAINT "tour_important_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_feature_links" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "inclusion" "InclusionType" NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tour_feature_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "what_to_take_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "what_to_take_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "what_to_take_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "what_to_take_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_what_to_take_links" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tour_what_to_take_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "contactMethod" TEXT,
    "source" "BookingSource" NOT NULL,
    "tourId" TEXT,
    "priceOptionId" TEXT,
    "sessionId" TEXT,
    "desiredDates" TEXT,
    "peopleCount" INTEGER,
    "tourFormat" TEXT,
    "comment" TEXT,
    "preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isCustomRequest" BOOLEAN NOT NULL DEFAULT false,
    "totalPrice" INTEGER,
    "status" "BookingStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "content" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guides" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "photo" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_info" (
    "id" TEXT NOT NULL,
    "aboutText" TEXT,
    "aboutImage" TEXT,
    "stats" JSONB NOT NULL DEFAULT '[]',
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroImage" TEXT,
    "contactPhone" TEXT,
    "telegramLink" TEXT,
    "vkLink" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RelatedTours" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RelatedTours_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProgramItemTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramItemTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tours_slug_key" ON "tours"("slug");

-- CreateIndex
CREATE INDEX "tours_categoryId_idx" ON "tours"("categoryId");

-- CreateIndex
CREATE INDEX "tours_isPublished_idx" ON "tours"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "tour_categories_slug_key" ON "tour_categories"("slug");

-- CreateIndex
CREATE INDEX "tour_program_items_tourId_idx" ON "tour_program_items"("tourId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_program_items_tourId_order_key" ON "tour_program_items"("tourId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "program_tags_name_key" ON "program_tags"("name");

-- CreateIndex
CREATE INDEX "tour_price_options_tourId_idx" ON "tour_price_options"("tourId");

-- CreateIndex
CREATE INDEX "tour_sessions_tourId_idx" ON "tour_sessions"("tourId");

-- CreateIndex
CREATE INDEX "tour_sessions_dateFrom_idx" ON "tour_sessions"("dateFrom");

-- CreateIndex
CREATE INDEX "tour_important_info_tourId_idx" ON "tour_important_info"("tourId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_features_name_key" ON "tour_features"("name");

-- CreateIndex
CREATE INDEX "tour_features_category_idx" ON "tour_features"("category");

-- CreateIndex
CREATE INDEX "tour_feature_links_tourId_idx" ON "tour_feature_links"("tourId");

-- CreateIndex
CREATE INDEX "tour_feature_links_featureId_idx" ON "tour_feature_links"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_feature_links_tourId_featureId_inclusion_key" ON "tour_feature_links"("tourId", "featureId", "inclusion");

-- CreateIndex
CREATE UNIQUE INDEX "what_to_take_categories_name_key" ON "what_to_take_categories"("name");

-- CreateIndex
CREATE INDEX "what_to_take_items_categoryId_idx" ON "what_to_take_items"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "what_to_take_items_categoryId_name_key" ON "what_to_take_items"("categoryId", "name");

-- CreateIndex
CREATE INDEX "tour_what_to_take_links_tourId_idx" ON "tour_what_to_take_links"("tourId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_what_to_take_links_tourId_itemId_key" ON "tour_what_to_take_links"("tourId", "itemId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_source_idx" ON "bookings"("source");

-- CreateIndex
CREATE INDEX "bookings_createdAt_idx" ON "bookings"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_isPublished_idx" ON "blog_posts"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "_RelatedTours_B_index" ON "_RelatedTours"("B");

-- CreateIndex
CREATE INDEX "_ProgramItemTags_B_index" ON "_ProgramItemTags"("B");

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "tour_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_program_items" ADD CONSTRAINT "tour_program_items_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_price_options" ADD CONSTRAINT "tour_price_options_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_sessions" ADD CONSTRAINT "tour_sessions_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_important_info" ADD CONSTRAINT "tour_important_info_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_feature_links" ADD CONSTRAINT "tour_feature_links_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_feature_links" ADD CONSTRAINT "tour_feature_links_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "tour_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "what_to_take_items" ADD CONSTRAINT "what_to_take_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "what_to_take_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_what_to_take_links" ADD CONSTRAINT "tour_what_to_take_links_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_what_to_take_links" ADD CONSTRAINT "tour_what_to_take_links_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "what_to_take_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_priceOptionId_fkey" FOREIGN KEY ("priceOptionId") REFERENCES "tour_price_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "tour_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedTours" ADD CONSTRAINT "_RelatedTours_A_fkey" FOREIGN KEY ("A") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedTours" ADD CONSTRAINT "_RelatedTours_B_fkey" FOREIGN KEY ("B") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramItemTags" ADD CONSTRAINT "_ProgramItemTags_A_fkey" FOREIGN KEY ("A") REFERENCES "program_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramItemTags" ADD CONSTRAINT "_ProgramItemTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tour_program_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
