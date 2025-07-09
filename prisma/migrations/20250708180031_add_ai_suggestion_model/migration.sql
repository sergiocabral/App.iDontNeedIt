-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('confidenceBoost', 'personsName');

-- CreateTable
CREATE TABLE "AiSuggestion" (
    "id" TEXT NOT NULL,
    "type" "SuggestionType" NOT NULL,
    "value" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSuggestion_pkey" PRIMARY KEY ("id")
);
