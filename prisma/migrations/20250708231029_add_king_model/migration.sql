-- CreateTable
CREATE TABLE "King" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "message" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "King_pkey" PRIMARY KEY ("id")
);
