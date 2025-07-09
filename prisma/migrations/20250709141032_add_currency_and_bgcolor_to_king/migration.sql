-- AlterTable
ALTER TABLE "King" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "imageBgColor" TEXT;

-- Custom SQL to set the default value for existing rows
UPDATE "King" SET "currency" = 'brl' WHERE "currency" IS NULL;
UPDATE "King" SET "imageBgColor" = '#C6ADED' WHERE "imageBgColor" IS NULL;
UPDATE "King" SET "imageUrl" = 'about:blank' WHERE "imageUrl" IS NULL;

ALTER TABLE "King" ALTER COLUMN "currency" SET NOT NULL;
ALTER TABLE "King" ALTER COLUMN "imageBgColor" SET NOT NULL;
ALTER TABLE "King" ALTER COLUMN "imageUrl" SET NOT NULL;
