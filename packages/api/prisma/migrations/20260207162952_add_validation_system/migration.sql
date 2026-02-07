/*
  Warnings:

  - You are about to drop the column `contributionBudget` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ValidationType" AS ENUM ('CONFIRMED', 'CHALLENGED', 'NUANCED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "contributionBudget",
ADD COLUMN     "validationCredits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Validation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "validationType" "ValidationType" NOT NULL,
    "comment" TEXT,
    "score" INTEGER NOT NULL DEFAULT 1,
    "claimId" TEXT,
    "argumentId" TEXT,
    "evidenceLinkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Validation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactSummary" (
    "id" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL,
    "keyFindings" JSONB,
    "limitations" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "ArtifactSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactSummaryRevision" (
    "id" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "changeDescription" TEXT NOT NULL,
    "previousContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ArtifactSummaryRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishingRule" (
    "id" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "ruleValue" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublishingRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Validation_userId_idx" ON "Validation"("userId");

-- CreateIndex
CREATE INDEX "Validation_claimId_idx" ON "Validation"("claimId");

-- CreateIndex
CREATE INDEX "Validation_argumentId_idx" ON "Validation"("argumentId");

-- CreateIndex
CREATE INDEX "Validation_evidenceLinkId_idx" ON "Validation"("evidenceLinkId");

-- CreateIndex
CREATE INDEX "Validation_validationType_idx" ON "Validation"("validationType");

-- CreateIndex
CREATE UNIQUE INDEX "Validation_userId_claimId_key" ON "Validation"("userId", "claimId");

-- CreateIndex
CREATE UNIQUE INDEX "Validation_userId_argumentId_key" ON "Validation"("userId", "argumentId");

-- CreateIndex
CREATE UNIQUE INDEX "Validation_userId_evidenceLinkId_key" ON "Validation"("userId", "evidenceLinkId");

-- CreateIndex
CREATE INDEX "ArtifactSummary_artifactId_idx" ON "ArtifactSummary"("artifactId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactSummary_artifactId_version_key" ON "ArtifactSummary"("artifactId", "version");

-- CreateIndex
CREATE INDEX "ArtifactSummaryRevision_summaryId_idx" ON "ArtifactSummaryRevision"("summaryId");

-- CreateIndex
CREATE INDEX "ArtifactSummaryRevision_createdById_idx" ON "ArtifactSummaryRevision"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "PublishingRule_ruleKey_key" ON "PublishingRule"("ruleKey");

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_evidenceLinkId_fkey" FOREIGN KEY ("evidenceLinkId") REFERENCES "EvidenceLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactSummary" ADD CONSTRAINT "ArtifactSummary_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactSummary" ADD CONSTRAINT "ArtifactSummary_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactSummaryRevision" ADD CONSTRAINT "ArtifactSummaryRevision_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "ArtifactSummary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactSummaryRevision" ADD CONSTRAINT "ArtifactSummaryRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
