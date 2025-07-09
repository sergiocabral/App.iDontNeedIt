-- AlterTable
ALTER TABLE "King" ADD COLUMN     "locale" TEXT;

-- Custom SQL to set the default value for existing rows
UPDATE "King" SET "locale" = 'en' WHERE "locale" IS NULL;
ALTER TABLE "King" ALTER COLUMN "locale" SET NOT NULL;
