-- CreateEnum
CREATE TYPE "SkillBookVisibility" AS ENUM ('PRIVATE', 'INTERNAL', 'STORE');

-- CreateEnum
CREATE TYPE "SkillBookStatus" AS ENUM ('DRAFT', 'READY', 'ARCHIVED');

-- CreateTable
CREATE TABLE "SkillBook" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "locale" "Locale" NOT NULL DEFAULT 'ko',
    "visibility" "SkillBookVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "SkillBookStatus" NOT NULL DEFAULT 'DRAFT',
    "body" TEXT NOT NULL,
    "compiledPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillBookSource" (
    "id" TEXT NOT NULL,
    "skillBookId" TEXT NOT NULL,
    "label" TEXT,
    "content" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillBookSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillBookListing" (
    "id" TEXT NOT NULL,
    "skillBookId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "priceCredits" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillBookListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillBookPurchase" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "skillBookId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "priceCredits" INTEGER NOT NULL,
    "sellerCredit" INTEGER NOT NULL,
    "platformFeeCredits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillBookPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillBook_ownerId_updatedAt_idx" ON "SkillBook"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "SkillBook_visibility_status_updatedAt_idx" ON "SkillBook"("visibility", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "SkillBookSource_skillBookId_orderIndex_idx" ON "SkillBookSource"("skillBookId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "SkillBookListing_skillBookId_key" ON "SkillBookListing"("skillBookId");

-- CreateIndex
CREATE INDEX "SkillBookListing_sellerId_isActive_idx" ON "SkillBookListing"("sellerId", "isActive");

-- CreateIndex
CREATE INDEX "SkillBookPurchase_buyerId_createdAt_idx" ON "SkillBookPurchase"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "SkillBookPurchase_sellerId_createdAt_idx" ON "SkillBookPurchase"("sellerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SkillBookPurchase_listingId_buyerId_key" ON "SkillBookPurchase"("listingId", "buyerId");

-- AddForeignKey
ALTER TABLE "SkillBook" ADD CONSTRAINT "SkillBook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillBookSource" ADD CONSTRAINT "SkillBookSource_skillBookId_fkey" FOREIGN KEY ("skillBookId") REFERENCES "SkillBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillBookListing" ADD CONSTRAINT "SkillBookListing_skillBookId_fkey" FOREIGN KEY ("skillBookId") REFERENCES "SkillBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillBookListing" ADD CONSTRAINT "SkillBookListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillBookPurchase" ADD CONSTRAINT "SkillBookPurchase_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "SkillBookListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillBookPurchase" ADD CONSTRAINT "SkillBookPurchase_skillBookId_fkey" FOREIGN KEY ("skillBookId") REFERENCES "SkillBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillBookPurchase" ADD CONSTRAINT "SkillBookPurchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillBookPurchase" ADD CONSTRAINT "SkillBookPurchase_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

