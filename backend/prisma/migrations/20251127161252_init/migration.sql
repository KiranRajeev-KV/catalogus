-- CreateEnum
CREATE TYPE "Type" AS ENUM ('MOVIE', 'TV', 'ANIME', 'DRAMA');

-- CreateEnum
CREATE TYPE "ApiSource" AS ENUM ('TMDB', 'TVDB', 'ANILIST', 'MDL');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH');

-- CreateTable
CREATE TABLE "media_items" (
    "item_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "api_source" "ApiSource" NOT NULL,
    "api_id" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "wishlist" (
    "wishlist_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "media_item_id" INTEGER NOT NULL,
    "status" "Status" NOT NULL,
    "rating" DECIMAL(65,30) DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("wishlist_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_items_api_source_api_id_key" ON "media_items"("api_source", "api_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "wishlist_user_id_status_idx" ON "wishlist"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_user_id_media_item_id_key" ON "wishlist"("user_id", "media_item_id");

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_media_item_id_fkey" FOREIGN KEY ("media_item_id") REFERENCES "media_items"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;
