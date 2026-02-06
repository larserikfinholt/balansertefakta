-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'OPEN', 'BALANCED', 'MATURE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('EMPIRICAL', 'CAUSAL', 'PROGNOSTIC', 'NORMATIVE', 'DEFINITIONAL');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PROPOSED', 'ACCEPTED', 'CHALLENGED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ArgumentType" AS ENUM ('PRO', 'CONTRA');

-- CreateEnum
CREATE TYPE "ArgumentStrength" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('ARTICLE', 'STUDY', 'REPORT', 'VIDEO', 'PODCAST', 'BOOK', 'SOCIAL_MEDIA', 'OFFICIAL_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ExtractType" AS ENUM ('QUOTE', 'PARAPHRASE', 'DATA_POINT', 'FIGURE', 'TABLE');

-- CreateEnum
CREATE TYPE "LinkageStrength" AS ENUM ('DIRECT', 'INDIRECT', 'CONSISTENT_WITH', 'WEAKLY_INDICATIVE', 'MISUSED_OR_NOT_SUPPORTING');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('MISQUOTE', 'CHERRY_PICKING', 'OUT_OF_CONTEXT', 'OUTDATED', 'METHODOLOGY', 'CONFLICT_OF_INTEREST', 'RELEVANCE');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('OPEN', 'DISCUSSED', 'ACKNOWLEDGED', 'RETRACTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "AuthLevel" AS ENUM ('ANONYMOUS', 'VERIFIED', 'STRONG_ID');

-- CreateEnum
CREATE TYPE "DescriptiveAssessment" AS ENUM ('LIKELY_TRUE', 'POSSIBLY_TRUE', 'UNCERTAIN', 'POSSIBLY_FALSE', 'LIKELY_FALSE');

-- CreateEnum
CREATE TYPE "NormativePreference" AS ENUM ('STRONGLY_SUPPORT', 'SUPPORT', 'NEUTRAL', 'OPPOSE', 'STRONGLY_OPPOSE');

-- CreateEnum
CREATE TYPE "JustificationType" AS ENUM ('DATA_BASED', 'VALUE_BASED', 'RISK_BASED');

-- CreateEnum
CREATE TYPE "TemporalScope" AS ENUM ('HISTORICAL', 'RECENT', 'CURRENT', 'SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "GeographicScope" AS ENUM ('GLOBAL', 'CONTINENTAL', 'NATIONAL', 'REGIONAL', 'LOCAL', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "ImpactCategory" AS ENUM ('ECONOMIC', 'ENVIRONMENTAL', 'SOCIAL', 'PRACTICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "DisagreementType" AS ENUM ('DATA', 'INTERPRETATION', 'VALUES_OR_RISK', 'DEFINITIONS', 'SCOPE');

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "status" "QuestionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "context" TEXT,
    "claimType" "ClaimType" NOT NULL DEFAULT 'EMPIRICAL',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "proArgumentCount" INTEGER NOT NULL DEFAULT 0,
    "contraArgumentCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measure" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rationale" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "proArgumentCount" INTEGER NOT NULL DEFAULT 0,
    "contraArgumentCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Measure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionClaim" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedById" TEXT,

    CONSTRAINT "QuestionClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionMeasure" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "measureId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedById" TEXT,

    CONSTRAINT "QuestionMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Argument" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "argumentType" "ArgumentType" NOT NULL,
    "strength" "ArgumentStrength" NOT NULL DEFAULT 'MEDIUM',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "claimId" TEXT,
    "measureId" TEXT,

    CONSTRAINT "Argument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counterposition" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "argumentId" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Counterposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "credibilityScore" DOUBLE PRECISION,
    "credibilityNotes" TEXT,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domainId" TEXT NOT NULL,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artifactType" "ArtifactType" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "authors" TEXT[],
    "outletId" TEXT,
    "doi" TEXT,
    "isbn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extract" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "extractType" "ExtractType" NOT NULL,
    "artifactId" TEXT NOT NULL,
    "pageNumber" TEXT,
    "timestamp" TEXT,
    "paragraph" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "Extract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceLink" (
    "id" TEXT NOT NULL,
    "extractId" TEXT NOT NULL,
    "claimId" TEXT,
    "argumentId" TEXT,
    "measureId" TEXT,
    "counterpositionId" TEXT,
    "linkageStrength" "LinkageStrength" NOT NULL DEFAULT 'DIRECT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "EvidenceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceChallenge" (
    "id" TEXT NOT NULL,
    "evidenceLinkId" TEXT NOT NULL,
    "challengeType" "ChallengeType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "SourceChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeResponse" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "evidenceLinkId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "proPoints" JSONB NOT NULL,
    "contraPoints" JSONB NOT NULL,
    "dataDisagreements" TEXT[],
    "interpretationDisagreements" TEXT[],
    "valueDisagreements" TEXT[],
    "openQuestions" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "passwordHash" TEXT,
    "authLevel" "AuthLevel" NOT NULL DEFAULT 'ANONYMOUS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contributionBudget" INTEGER NOT NULL DEFAULT 10,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "descriptiveAssessment" "DescriptiveAssessment",
    "normativePreference" "NormativePreference",
    "justifications" "JustificationType"[],
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope" (
    "id" TEXT NOT NULL,
    "temporalScope" "TemporalScope" NOT NULL DEFAULT 'UNSPECIFIED',
    "geographicScope" "GeographicScope" NOT NULL DEFAULT 'UNSPECIFIED',
    "systemBoundary" TEXT NOT NULL,
    "assumptions" TEXT,
    "questionId" TEXT,
    "claimId" TEXT,
    "argumentId" TEXT,
    "measureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Scope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasureImpact" (
    "id" TEXT NOT NULL,
    "measureId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "category" "ImpactCategory",
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "rangeLow" DOUBLE PRECISION,
    "rangeHigh" DOUBLE PRECISION,
    "valueText" TEXT,
    "confidence" "Confidence" NOT NULL DEFAULT 'MEDIUM',
    "timeHorizon" "TemporalScope",
    "source" TEXT,
    "assumptions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "MeasureImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disagreement" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "disagreementType" "DisagreementType" NOT NULL,
    "questionId" TEXT,
    "claimId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Disagreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_slug_idx" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Subtopic_topicId_idx" ON "Subtopic"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "Subtopic_topicId_slug_key" ON "Subtopic"("topicId", "slug");

-- CreateIndex
CREATE INDEX "Question_subtopicId_idx" ON "Question"("subtopicId");

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "Question"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Question_subtopicId_slug_key" ON "Question"("subtopicId", "slug");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_claimType_idx" ON "Claim"("claimType");

-- CreateIndex
CREATE INDEX "Measure_status_idx" ON "Measure"("status");

-- CreateIndex
CREATE INDEX "QuestionClaim_questionId_idx" ON "QuestionClaim"("questionId");

-- CreateIndex
CREATE INDEX "QuestionClaim_claimId_idx" ON "QuestionClaim"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionClaim_questionId_claimId_key" ON "QuestionClaim"("questionId", "claimId");

-- CreateIndex
CREATE INDEX "QuestionMeasure_questionId_idx" ON "QuestionMeasure"("questionId");

-- CreateIndex
CREATE INDEX "QuestionMeasure_measureId_idx" ON "QuestionMeasure"("measureId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionMeasure_questionId_measureId_key" ON "QuestionMeasure"("questionId", "measureId");

-- CreateIndex
CREATE INDEX "Argument_claimId_idx" ON "Argument"("claimId");

-- CreateIndex
CREATE INDEX "Argument_measureId_idx" ON "Argument"("measureId");

-- CreateIndex
CREATE INDEX "Argument_argumentType_idx" ON "Argument"("argumentType");

-- CreateIndex
CREATE INDEX "Counterposition_argumentId_idx" ON "Counterposition"("argumentId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_hostname_key" ON "Domain"("hostname");

-- CreateIndex
CREATE INDEX "Domain_hostname_idx" ON "Domain"("hostname");

-- CreateIndex
CREATE INDEX "Outlet_domainId_idx" ON "Outlet"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_url_key" ON "Artifact"("url");

-- CreateIndex
CREATE INDEX "Artifact_outletId_idx" ON "Artifact"("outletId");

-- CreateIndex
CREATE INDEX "Artifact_artifactType_idx" ON "Artifact"("artifactType");

-- CreateIndex
CREATE INDEX "Extract_artifactId_idx" ON "Extract"("artifactId");

-- CreateIndex
CREATE INDEX "EvidenceLink_extractId_idx" ON "EvidenceLink"("extractId");

-- CreateIndex
CREATE INDEX "EvidenceLink_claimId_idx" ON "EvidenceLink"("claimId");

-- CreateIndex
CREATE INDEX "EvidenceLink_argumentId_idx" ON "EvidenceLink"("argumentId");

-- CreateIndex
CREATE INDEX "EvidenceLink_measureId_idx" ON "EvidenceLink"("measureId");

-- CreateIndex
CREATE INDEX "SourceChallenge_evidenceLinkId_idx" ON "SourceChallenge"("evidenceLinkId");

-- CreateIndex
CREATE INDEX "SourceChallenge_challengeType_idx" ON "SourceChallenge"("challengeType");

-- CreateIndex
CREATE INDEX "SourceChallenge_status_idx" ON "SourceChallenge"("status");

-- CreateIndex
CREATE INDEX "ChallengeResponse_challengeId_idx" ON "ChallengeResponse"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengeResponse_parentId_idx" ON "ChallengeResponse"("parentId");

-- CreateIndex
CREATE INDEX "Summary_questionId_idx" ON "Summary"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Summary_questionId_version_key" ON "Summary"("questionId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_authLevel_idx" ON "User"("authLevel");

-- CreateIndex
CREATE INDEX "UserStance_questionId_idx" ON "UserStance"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStance_userId_questionId_key" ON "UserStance"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope_questionId_key" ON "Scope"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope_claimId_key" ON "Scope"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope_argumentId_key" ON "Scope"("argumentId");

-- CreateIndex
CREATE UNIQUE INDEX "Scope_measureId_key" ON "Scope"("measureId");

-- CreateIndex
CREATE INDEX "Scope_temporalScope_idx" ON "Scope"("temporalScope");

-- CreateIndex
CREATE INDEX "Scope_geographicScope_idx" ON "Scope"("geographicScope");

-- CreateIndex
CREATE INDEX "MeasureImpact_measureId_idx" ON "MeasureImpact"("measureId");

-- CreateIndex
CREATE INDEX "MeasureImpact_category_idx" ON "MeasureImpact"("category");

-- CreateIndex
CREATE INDEX "Disagreement_questionId_idx" ON "Disagreement"("questionId");

-- CreateIndex
CREATE INDEX "Disagreement_claimId_idx" ON "Disagreement"("claimId");

-- CreateIndex
CREATE INDEX "Disagreement_disagreementType_idx" ON "Disagreement"("disagreementType");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- CreateIndex
CREATE INDEX "Event_entityType_entityId_idx" ON "Event"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtopic" ADD CONSTRAINT "Subtopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtopic" ADD CONSTRAINT "Subtopic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measure" ADD CONSTRAINT "Measure_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionClaim" ADD CONSTRAINT "QuestionClaim_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionClaim" ADD CONSTRAINT "QuestionClaim_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionClaim" ADD CONSTRAINT "QuestionClaim_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMeasure" ADD CONSTRAINT "QuestionMeasure_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMeasure" ADD CONSTRAINT "QuestionMeasure_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMeasure" ADD CONSTRAINT "QuestionMeasure_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Argument" ADD CONSTRAINT "Argument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Argument" ADD CONSTRAINT "Argument_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Argument" ADD CONSTRAINT "Argument_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Counterposition" ADD CONSTRAINT "Counterposition_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Counterposition" ADD CONSTRAINT "Counterposition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outlet" ADD CONSTRAINT "Outlet_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extract" ADD CONSTRAINT "Extract_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extract" ADD CONSTRAINT "Extract_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_extractId_fkey" FOREIGN KEY ("extractId") REFERENCES "Extract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_counterpositionId_fkey" FOREIGN KEY ("counterpositionId") REFERENCES "Counterposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceChallenge" ADD CONSTRAINT "SourceChallenge_evidenceLinkId_fkey" FOREIGN KEY ("evidenceLinkId") REFERENCES "EvidenceLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceChallenge" ADD CONSTRAINT "SourceChallenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeResponse" ADD CONSTRAINT "ChallengeResponse_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "SourceChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeResponse" ADD CONSTRAINT "ChallengeResponse_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChallengeResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeResponse" ADD CONSTRAINT "ChallengeResponse_evidenceLinkId_fkey" FOREIGN KEY ("evidenceLinkId") REFERENCES "EvidenceLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeResponse" ADD CONSTRAINT "ChallengeResponse_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStance" ADD CONSTRAINT "UserStance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStance" ADD CONSTRAINT "UserStance_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope" ADD CONSTRAINT "Scope_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope" ADD CONSTRAINT "Scope_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope" ADD CONSTRAINT "Scope_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope" ADD CONSTRAINT "Scope_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scope" ADD CONSTRAINT "Scope_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasureImpact" ADD CONSTRAINT "MeasureImpact_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasureImpact" ADD CONSTRAINT "MeasureImpact_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disagreement" ADD CONSTRAINT "Disagreement_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disagreement" ADD CONSTRAINT "Disagreement_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disagreement" ADD CONSTRAINT "Disagreement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
