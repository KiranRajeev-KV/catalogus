/*
  Warnings:

  - The values [MDL] on the enum `ApiSource` will be removed. If these variants are still used in the database, this will fail.
  - The values [DRAMA] on the enum `Type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApiSource_new" AS ENUM ('TMDB', 'TVDB', 'ANILIST');
ALTER TABLE "media_items" ALTER COLUMN "apiSource" TYPE "ApiSource_new" USING ("apiSource"::text::"ApiSource_new");
ALTER TYPE "ApiSource" RENAME TO "ApiSource_old";
ALTER TYPE "ApiSource_new" RENAME TO "ApiSource";
DROP TYPE "public"."ApiSource_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Type_new" AS ENUM ('MOVIE', 'TV', 'ANIME');
ALTER TABLE "media_items" ALTER COLUMN "type" TYPE "Type_new" USING ("type"::text::"Type_new");
ALTER TYPE "Type" RENAME TO "Type_old";
ALTER TYPE "Type_new" RENAME TO "Type";
DROP TYPE "public"."Type_old";
COMMIT;
