/*
  Warnings:

  - You are about to drop the column `used` on the `AiSuggestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiSuggestion" DROP COLUMN "used",
ADD COLUMN     "reservedUntil" TIMESTAMP(3);
