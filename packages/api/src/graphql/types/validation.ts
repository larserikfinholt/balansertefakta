import { builder } from '../builder.js';

// Enums
builder.enumType('ValidationType', {
  values: ['CONFIRMED', 'CHALLENGED', 'NUANCED'] as const,
});

// Validation type
builder.prismaObject('Validation', {
  fields: (t) => ({
    id: t.exposeID('id'),
    validationType: t.expose('validationType', { type: 'ValidationType' }),
    comment: t.exposeString('comment', { nullable: true }),
    score: t.exposeInt('score'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    user: t.relation('user'),
    claim: t.relation('claim', { nullable: true }),
    argument: t.relation('argument', { nullable: true }),
    evidenceLink: t.relation('evidenceLink', { nullable: true }),
  }),
});

// ArtifactSummary type
builder.prismaObject('ArtifactSummary', {
  fields: (t) => ({
    id: t.exposeID('id'),
    version: t.exposeInt('version'),
    content: t.exposeString('content'),
    keyFindings: t.expose('keyFindings', { type: 'JSON', nullable: true }),
    limitations: t.exposeString('limitations', { nullable: true }),
    status: t.expose('status', { type: 'ContentStatus' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    artifact: t.relation('artifact'),
    createdBy: t.relation('createdBy', { nullable: true }),
    revisions: t.relation('revisions'),
  }),
});

// ArtifactSummaryRevision type
builder.prismaObject('ArtifactSummaryRevision', {
  fields: (t) => ({
    id: t.exposeID('id'),
    changeDescription: t.exposeString('changeDescription'),
    previousContent: t.exposeString('previousContent'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    summary: t.relation('summary'),
    createdBy: t.relation('createdBy'),
  }),
});

// PublishingRule type
builder.prismaObject('PublishingRule', {
  fields: (t) => ({
    id: t.exposeID('id'),
    ruleKey: t.exposeString('ruleKey'),
    ruleValue: t.exposeInt('ruleValue'),
    description: t.exposeString('description', { nullable: true }),
    isActive: t.exposeBoolean('isActive'),
  }),
});

// CanPublish result type
const CanPublishResult = builder.objectRef<{
  allowed: boolean;
  currentCredits: number;
  requiredCredits: number;
  opposingValidationsCount: number;
  requiredOpposingValidations: number;
  reasons: string[];
}>('CanPublishResult').implement({
  fields: (t) => ({
    allowed: t.exposeBoolean('allowed'),
    currentCredits: t.exposeInt('currentCredits'),
    requiredCredits: t.exposeInt('requiredCredits'),
    opposingValidationsCount: t.exposeInt('opposingValidationsCount'),
    requiredOpposingValidations: t.exposeInt('requiredOpposingValidations'),
    reasons: t.exposeStringList('reasons'),
  }),
});

// MyStatus result type
const MyStatusResult = builder.objectRef<{
  validationCredits: number;
  qualityScore: number;
  totalValidations: number;
  confirmedCount: number;
  challengedCount: number;
  nuancedCount: number;
  claimsCreated: number;
  argumentsCreated: number;
}>('MyStatusResult').implement({
  fields: (t) => ({
    validationCredits: t.exposeInt('validationCredits'),
    qualityScore: t.exposeFloat('qualityScore'),
    totalValidations: t.exposeInt('totalValidations'),
    confirmedCount: t.exposeInt('confirmedCount'),
    challengedCount: t.exposeInt('challengedCount'),
    nuancedCount: t.exposeInt('nuancedCount'),
    claimsCreated: t.exposeInt('claimsCreated'),
    argumentsCreated: t.exposeInt('argumentsCreated'),
  }),
});

// Input types
const CreateValidationInput = builder.inputType('CreateValidationInput', {
  fields: (t) => ({
    validationType: t.field({ type: 'ValidationType', required: true }),
    comment: t.string(),
    claimId: t.string(),
    argumentId: t.string(),
    evidenceLinkId: t.string(),
  }),
});

const CreateArtifactSummaryInput = builder.inputType('CreateArtifactSummaryInput', {
  fields: (t) => ({
    artifactId: t.string({ required: true }),
    content: t.string({ required: true }),
    keyFindings: t.field({ type: 'JSON' }),
    limitations: t.string(),
  }),
});

const ReviseArtifactSummaryInput = builder.inputType('ReviseArtifactSummaryInput', {
  fields: (t) => ({
    summaryId: t.string({ required: true }),
    content: t.string({ required: true }),
    changeDescription: t.string({ required: true }),
    keyFindings: t.field({ type: 'JSON' }),
    limitations: t.string(),
  }),
});

// Helper: get a publishing rule value
async function getRuleValue(prisma: any, key: string, fallback: number): Promise<number> {
  const rule = await prisma.publishingRule.findUnique({ where: { ruleKey: key } });
  if (rule && rule.isActive) return rule.ruleValue;
  return fallback;
}

// ============================================
// QUERIES
// ============================================

builder.queryField('publishingRules', (t) =>
  t.prismaField({
    type: ['PublishingRule'],
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.publishingRule.findMany({ ...query, where: { isActive: true } }),
  })
);

builder.queryField('myValidations', (t) =>
  t.prismaField({
    type: ['Validation'],
    resolve: (query, _root, _args, ctx) => {
      if (!ctx.userId) return [];
      return ctx.prisma.validation.findMany({
        ...query,
        where: { userId: ctx.userId },
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);

builder.queryField('validationsForClaim', (t) =>
  t.prismaField({
    type: ['Validation'],
    args: { claimId: t.arg.string({ required: true }) },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.validation.findMany({
        ...query,
        where: { claimId: args.claimId },
        orderBy: { createdAt: 'desc' },
      }),
  })
);

builder.queryField('validationsForArgument', (t) =>
  t.prismaField({
    type: ['Validation'],
    args: { argumentId: t.arg.string({ required: true }) },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.validation.findMany({
        ...query,
        where: { argumentId: args.argumentId },
        orderBy: { createdAt: 'desc' },
      }),
  })
);

builder.queryField('artifactSummary', (t) =>
  t.prismaField({
    type: 'ArtifactSummary',
    nullable: true,
    args: { artifactId: t.arg.string({ required: true }) },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.artifactSummary.findFirst({
        ...query,
        where: { artifactId: args.artifactId },
        orderBy: { version: 'desc' },
      }),
  })
);

builder.queryField('artifactSummaryHistory', (t) =>
  t.prismaField({
    type: ['ArtifactSummary'],
    args: { artifactId: t.arg.string({ required: true }) },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.artifactSummary.findMany({
        ...query,
        where: { artifactId: args.artifactId },
        orderBy: { version: 'desc' },
      }),
  })
);

builder.queryField('canPublish', (t) =>
  t.field({
    type: CanPublishResult,
    args: {
      contentType: t.arg.string({ required: true }), // "CLAIM" or "ARGUMENT"
      argumentType: t.arg.string(), // "PRO" or "CONTRA" (only for ARGUMENT)
    },
    resolve: async (_root, args, ctx) => {
      const reasons: string[] = [];

      if (!ctx.userId) {
        return {
          allowed: false,
          currentCredits: 0,
          requiredCredits: 0,
          opposingValidationsCount: 0,
          requiredOpposingValidations: 0,
          reasons: ['Må være innlogget'],
        };
      }

      const user = await ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
      if (!user) {
        return {
          allowed: false,
          currentCredits: 0,
          requiredCredits: 0,
          opposingValidationsCount: 0,
          requiredOpposingValidations: 0,
          reasons: ['Bruker ikke funnet'],
        };
      }

      const creditKey = args.contentType === 'CLAIM' ? 'credits_per_claim' : 'credits_per_argument';
      const requiredCredits = await getRuleValue(ctx.prisma, creditKey, args.contentType === 'CLAIM' ? 3 : 2);
      const requiredOpposing = await getRuleValue(ctx.prisma, 'min_opposing_validations', 2);

      if (user.validationCredits < requiredCredits) {
        reasons.push(`Trenger ${requiredCredits} kreditter, har ${user.validationCredits}`);
      }

      // Count opposing validations: for a PRO argument, need validations on CONTRA arguments (and vice versa)
      let opposingValidationsCount = 0;
      if (args.contentType === 'ARGUMENT' && args.argumentType) {
        const opposingType = args.argumentType === 'PRO' ? 'CONTRA' : 'PRO';
        opposingValidationsCount = await ctx.prisma.validation.count({
          where: {
            userId: ctx.userId,
            argument: { argumentType: opposingType },
          },
        });
      } else {
        // For claims: count total validations
        opposingValidationsCount = await ctx.prisma.validation.count({
          where: { userId: ctx.userId },
        });
      }

      if (opposingValidationsCount < requiredOpposing) {
        reasons.push(`Trenger ${requiredOpposing} valideringer av motstridende innhold, har ${opposingValidationsCount}`);
      }

      return {
        allowed: reasons.length === 0,
        currentCredits: user.validationCredits,
        requiredCredits,
        opposingValidationsCount,
        requiredOpposingValidations: requiredOpposing,
        reasons,
      };
    },
  })
);

builder.queryField('myStatus', (t) =>
  t.field({
    type: MyStatusResult,
    resolve: async (_root, _args, ctx) => {
      if (!ctx.userId) {
        return {
          validationCredits: 0,
          qualityScore: 0,
          totalValidations: 0,
          confirmedCount: 0,
          challengedCount: 0,
          nuancedCount: 0,
          claimsCreated: 0,
          argumentsCreated: 0,
        };
      }

      const user = await ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
      if (!user) throw new Error('Bruker ikke funnet');

      const [totalValidations, confirmedCount, challengedCount, nuancedCount, claimsCreated, argumentsCreated] =
        await Promise.all([
          ctx.prisma.validation.count({ where: { userId: ctx.userId } }),
          ctx.prisma.validation.count({ where: { userId: ctx.userId, validationType: 'CONFIRMED' } }),
          ctx.prisma.validation.count({ where: { userId: ctx.userId, validationType: 'CHALLENGED' } }),
          ctx.prisma.validation.count({ where: { userId: ctx.userId, validationType: 'NUANCED' } }),
          ctx.prisma.claim.count({ where: { createdById: ctx.userId } }),
          ctx.prisma.argument.count({ where: { createdById: ctx.userId } }),
        ]);

      return {
        validationCredits: user.validationCredits,
        qualityScore: user.qualityScore,
        totalValidations,
        confirmedCount,
        challengedCount,
        nuancedCount,
        claimsCreated,
        argumentsCreated,
      };
    },
  })
);

// ============================================
// MUTATIONS
// ============================================

builder.mutationField('createValidation', (t) =>
  t.prismaField({
    type: 'Validation',
    args: { input: t.arg({ type: CreateValidationInput, required: true }) },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.userId) throw new Error('Må være innlogget for å validere');

      const targets = [args.input.claimId, args.input.argumentId, args.input.evidenceLinkId].filter(Boolean);
      if (targets.length !== 1) {
        throw new Error('Validering må gjelde nøyaktig ett mål (claim, argument eller evidenceLink)');
      }

      const creditsPerValidation = await getRuleValue(ctx.prisma, 'credits_per_validation', 1);

      const validation = await ctx.prisma.validation.create({
        ...query,
        data: {
          userId: ctx.userId,
          validationType: args.input.validationType,
          comment: args.input.comment,
          score: creditsPerValidation,
          claimId: args.input.claimId,
          argumentId: args.input.argumentId,
          evidenceLinkId: args.input.evidenceLinkId,
        },
      });

      // Award credits and quality score
      await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: {
          validationCredits: { increment: creditsPerValidation },
          qualityScore: { increment: 0.5 },
        },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'create_validation',
          entityType: 'Validation',
          entityId: validation.id,
          payload: { ...args.input, score: creditsPerValidation },
          userId: ctx.userId,
        },
      });

      return validation;
    },
  })
);

builder.mutationField('createArtifactSummary', (t) =>
  t.prismaField({
    type: 'ArtifactSummary',
    args: { input: t.arg({ type: CreateArtifactSummaryInput, required: true }) },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.userId) throw new Error('Må være innlogget');

      const latestSummary = await ctx.prisma.artifactSummary.findFirst({
        where: { artifactId: args.input.artifactId },
        orderBy: { version: 'desc' },
      });

      const nextVersion = (latestSummary?.version ?? 0) + 1;

      const summary = await ctx.prisma.artifactSummary.create({
        ...query,
        data: {
          artifactId: args.input.artifactId,
          version: nextVersion,
          content: args.input.content,
          keyFindings: args.input.keyFindings,
          limitations: args.input.limitations,
          createdById: ctx.userId,
        },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'create_artifact_summary',
          entityType: 'ArtifactSummary',
          entityId: summary.id,
          payload: { ...args.input, version: nextVersion },
          userId: ctx.userId,
        },
      });

      return summary;
    },
  })
);

builder.mutationField('reviseArtifactSummary', (t) =>
  t.prismaField({
    type: 'ArtifactSummary',
    args: { input: t.arg({ type: ReviseArtifactSummaryInput, required: true }) },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.userId) throw new Error('Må være innlogget');

      const existing = await ctx.prisma.artifactSummary.findUnique({
        where: { id: args.input.summaryId },
      });
      if (!existing) throw new Error('Oppsummering ikke funnet');

      // Save revision history
      await ctx.prisma.artifactSummaryRevision.create({
        data: {
          summaryId: existing.id,
          changeDescription: args.input.changeDescription,
          previousContent: existing.content,
          createdById: ctx.userId,
        },
      });

      // Create new version
      const nextVersion = existing.version + 1;
      const newSummary = await ctx.prisma.artifactSummary.create({
        ...query,
        data: {
          artifactId: existing.artifactId,
          version: nextVersion,
          content: args.input.content,
          keyFindings: args.input.keyFindings ?? existing.keyFindings,
          limitations: args.input.limitations ?? existing.limitations,
          createdById: ctx.userId,
        },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'revise_artifact_summary',
          entityType: 'ArtifactSummary',
          entityId: newSummary.id,
          payload: { ...args.input, version: nextVersion },
          userId: ctx.userId,
        },
      });

      return newSummary;
    },
  })
);
