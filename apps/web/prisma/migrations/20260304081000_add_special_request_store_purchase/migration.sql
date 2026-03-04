-- CreateEnum
CREATE TYPE "SpecialTemplateRequestStatus" AS ENUM (
    'REQUESTED',
    'REVIEWING',
    'IN_PROGRESS',
    'DELIVERED',
    'REJECTED',
    'CANCELED'
);

-- CreateTable
CREATE TABLE "SpecialTemplateRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SpecialTemplateRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "consentPublicSource" BOOLEAN NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialTemplateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateStoreListing" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "priceCredits" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateStoreListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePurchase" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "priceCredits" INTEGER NOT NULL,
    "sellerCredit" INTEGER NOT NULL,
    "platformFeeCredits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplatePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpecialTemplateRequest_requesterId_createdAt_idx" ON "SpecialTemplateRequest"("requesterId", "createdAt");

-- CreateIndex
CREATE INDEX "SpecialTemplateRequest_status_createdAt_idx" ON "SpecialTemplateRequest"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateStoreListing_templateId_key" ON "TemplateStoreListing"("templateId");

-- CreateIndex
CREATE INDEX "TemplateStoreListing_sellerId_isActive_idx" ON "TemplateStoreListing"("sellerId", "isActive");

-- CreateIndex
CREATE INDEX "TemplatePurchase_buyerId_createdAt_idx" ON "TemplatePurchase"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "TemplatePurchase_sellerId_createdAt_idx" ON "TemplatePurchase"("sellerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePurchase_listingId_buyerId_key" ON "TemplatePurchase"("listingId", "buyerId");

-- AddForeignKey
ALTER TABLE "SpecialTemplateRequest" ADD CONSTRAINT "SpecialTemplateRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateStoreListing" ADD CONSTRAINT "TemplateStoreListing_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateStoreListing" ADD CONSTRAINT "TemplateStoreListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "TemplateStoreListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
