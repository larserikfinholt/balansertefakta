import { builder } from '../builder.js';

// Enums
builder.enumType('ArtifactType', {
  values: ['ARTICLE', 'STUDY', 'REPORT', 'VIDEO', 'PODCAST', 'BOOK', 'SOCIAL_MEDIA', 'OFFICIAL_DOCUMENT', 'OTHER'] as const,
});

builder.enumType('ExtractType', {
  values: ['QUOTE', 'PARAPHRASE', 'DATA_POINT', 'FIGURE', 'TABLE'] as const,
});

builder.enumType('SupportStrength', {
  values: ['STRONGLY_SUPPORTS', 'SUPPORTS', 'WEAKLY_SUPPORTS', 'NEUTRAL', 'CONTRADICTS'] as const,
});

builder.enumType('ChallengeType', {
  values: ['MISQUOTE', 'CHERRY_PICKING', 'OUT_OF_CONTEXT', 'OUTDATED', 'METHODOLOGY', 'CONFLICT_OF_INTEREST', 'RELEVANCE'] as const,
});

builder.enumType('ChallengeStatus', {
  values: ['OPEN', 'DISCUSSED', 'ACKNOWLEDGED', 'RETRACTED', 'FLAGGED'] as const,
});

// Domain type
builder.prismaObject('Domain', {
  fields: (t) => ({
    id: t.exposeID('id'),
    hostname: t.exposeString('hostname'),
    name: t.exposeString('name', { nullable: true }),
    description: t.exposeString('description', { nullable: true }),
    credibilityScore: t.exposeFloat('credibilityScore', { nullable: true }),
    credibilityNotes: t.exposeString('credibilityNotes', { nullable: true }),
    outlets: t.relation('outlets'),
  }),
});

// Outlet type
builder.prismaObject('Outlet', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description', { nullable: true }),
    domain: t.relation('domain'),
    artifacts: t.relation('artifacts'),
  }),
});

// Artifact type
builder.prismaObject('Artifact', {
  fields: (t) => ({
    id: t.exposeID('id'),
    url: t.exposeString('url'),
    title: t.exposeString('title'),
    artifactType: t.expose('artifactType', { type: 'ArtifactType' }),
    publishedAt: t.expose('publishedAt', { type: 'DateTime', nullable: true }),
    authors: t.exposeStringList('authors'),
    doi: t.exposeString('doi', { nullable: true }),
    isbn: t.exposeString('isbn', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    outlet: t.relation('outlet', { nullable: true }),
    extracts: t.relation('extracts'),
  }),
});

// Extract type
builder.prismaObject('Extract', {
  fields: (t) => ({
    id: t.exposeID('id'),
    content: t.exposeString('content'),
    extractType: t.expose('extractType', { type: 'ExtractType' }),
    pageNumber: t.exposeString('pageNumber', { nullable: true }),
    timestamp: t.exposeString('timestamp', { nullable: true }),
    paragraph: t.exposeString('paragraph', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    artifact: t.relation('artifact'),
    createdBy: t.relation('createdBy', { nullable: true }),
    evidenceLinks: t.relation('evidenceLinks'),
  }),
});

// EvidenceLink type
builder.prismaObject('EvidenceLink', {
  fields: (t) => ({
    id: t.exposeID('id'),
    supportStrength: t.expose('supportStrength', { type: 'SupportStrength' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    extract: t.relation('extract'),
    claim: t.relation('claim', { nullable: true }),
    argument: t.relation('argument', { nullable: true }),
    measure: t.relation('measure', { nullable: true }),
    counterposition: t.relation('counterposition', { nullable: true }),
    createdBy: t.relation('createdBy', { nullable: true }),
    challenges: t.relation('challenges'),
    
    // Has this link been challenged?
    isChallenged: t.boolean({
      resolve: async (link, _args, ctx) => {
        const activeChallenges = await ctx.prisma.sourceChallenge.count({
          where: {
            evidenceLinkId: link.id,
            status: { in: ['OPEN', 'DISCUSSED', 'ACKNOWLEDGED', 'FLAGGED'] },
          },
        });
        return activeChallenges > 0;
      },
    }),
  }),
});

// SourceChallenge type
builder.prismaObject('SourceChallenge', {
  fields: (t) => ({
    id: t.exposeID('id'),
    challengeType: t.expose('challengeType', { type: 'ChallengeType' }),
    description: t.exposeString('description'),
    status: t.expose('status', { type: 'ChallengeStatus' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    evidenceLink: t.relation('evidenceLink'),
    createdBy: t.relation('createdBy', { nullable: true }),
    responses: t.relation('responses'),

    // Count of responses
    responseCount: t.int({
      resolve: async (challenge, _args, ctx) => {
        return ctx.prisma.challengeResponse.count({
          where: { challengeId: challenge.id },
        });
      },
    }),
  }),
});

// ChallengeResponse type
builder.prismaObject('ChallengeResponse', {
  fields: (t) => ({
    id: t.exposeID('id'),
    content: t.exposeString('content'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    challenge: t.relation('challenge'),
    parent: t.relation('parent', { nullable: true }),
    replies: t.relation('replies'),
    createdBy: t.relation('createdBy'),
    evidenceLink: t.relation('evidenceLink', { nullable: true }),

    // Computed depth (0 = direct response to challenge, 1 = reply to response)
    depth: t.int({
      resolve: async (response, _args, ctx) => {
        if (!response.parentId) return 0;
        const parent = await ctx.prisma.challengeResponse.findUnique({
          where: { id: response.parentId },
          select: { parentId: true },
        });
        return parent?.parentId ? 2 : 1;
      },
    }),
  }),
});

// Input types
const CreateArtifactInput = builder.inputType('CreateArtifactInput', {
  fields: (t) => ({
    url: t.string({ required: true }),
    title: t.string({ required: true }),
    artifactType: t.field({ type: 'ArtifactType', required: true }),
    publishedAt: t.field({ type: 'DateTime' }),
    authors: t.stringList(),
    outletId: t.string(),
    doi: t.string(),
    isbn: t.string(),
  }),
});

const CreateExtractInput = builder.inputType('CreateExtractInput', {
  fields: (t) => ({
    artifactId: t.string({ required: true }),
    content: t.string({ required: true }),
    extractType: t.field({ type: 'ExtractType', required: true }),
    pageNumber: t.string(),
    timestamp: t.string(),
    paragraph: t.string(),
  }),
});

const LinkEvidenceInput = builder.inputType('LinkEvidenceInput', {
  fields: (t) => ({
    extractId: t.string({ required: true }),
    supportStrength: t.field({ type: 'SupportStrength' }),
    claimId: t.string(),
    argumentId: t.string(),
    measureId: t.string(),
    counterpositionId: t.string(),
  }),
});

const ChallengeSourceInput = builder.inputType('ChallengeSourceInput', {
  fields: (t) => ({
    evidenceLinkId: t.string({ required: true }),
    challengeType: t.field({ type: 'ChallengeType', required: true }),
    description: t.string({ required: true }),
  }),
});

const CreateChallengeResponseInput = builder.inputType('CreateChallengeResponseInput', {
  fields: (t) => ({
    challengeId: t.string({ required: true }),
    parentId: t.string(),  // For nested responses
    content: t.string({ required: true }),
    evidenceLinkId: t.string(),  // Optional counter-evidence
  }),
});

// Queries
builder.queryField('artifact', (t) =>
  t.prismaField({
    type: 'Artifact',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.artifact.findUnique({
        ...query,
        where: { id: args.id },
      }),
  })
);

builder.queryField('domains', (t) =>
  t.prismaField({
    type: ['Domain'],
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.domain.findMany({
        ...query,
        orderBy: { hostname: 'asc' },
      }),
  })
);

// Mutations
builder.mutationField('createArtifact', (t) =>
  t.prismaField({
    type: 'Artifact',
    args: {
      input: t.arg({ type: CreateArtifactInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const artifact = await ctx.prisma.artifact.create({
        ...query,
        data: {
          url: args.input.url,
          title: args.input.title,
          artifactType: args.input.artifactType,
          publishedAt: args.input.publishedAt,
          authors: args.input.authors ?? [],
          outletId: args.input.outletId,
          doi: args.input.doi,
          isbn: args.input.isbn,
        },
      });
      
      await ctx.prisma.event.create({
        data: {
          eventType: 'create_artifact',
          entityType: 'Artifact',
          entityId: artifact.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });
      
      return artifact;
    },
  })
);

builder.mutationField('createExtract', (t) =>
  t.prismaField({
    type: 'Extract',
    args: {
      input: t.arg({ type: CreateExtractInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const extract = await ctx.prisma.extract.create({
        ...query,
        data: {
          artifactId: args.input.artifactId,
          content: args.input.content,
          extractType: args.input.extractType,
          pageNumber: args.input.pageNumber,
          timestamp: args.input.timestamp,
          paragraph: args.input.paragraph,
          createdById: ctx.userId,
        },
      });
      
      await ctx.prisma.event.create({
        data: {
          eventType: 'create_extract',
          entityType: 'Extract',
          entityId: extract.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });
      
      return extract;
    },
  })
);

builder.mutationField('linkEvidence', (t) =>
  t.prismaField({
    type: 'EvidenceLink',
    args: {
      input: t.arg({ type: LinkEvidenceInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // Validate: must have exactly one target
      const targets = [args.input.claimId, args.input.argumentId, args.input.measureId, args.input.counterpositionId].filter(Boolean);
      if (targets.length !== 1) {
        throw new Error('Evidence must be linked to exactly one target (claim, argument, measure, or counterposition)');
      }
      
      const link = await ctx.prisma.evidenceLink.create({
        ...query,
        data: {
          extractId: args.input.extractId,
          supportStrength: args.input.supportStrength ?? 'SUPPORTS',
          claimId: args.input.claimId,
          argumentId: args.input.argumentId,
          measureId: args.input.measureId,
          counterpositionId: args.input.counterpositionId,
          createdById: ctx.userId,
        },
      });
      
      await ctx.prisma.event.create({
        data: {
          eventType: 'link_evidence',
          entityType: 'EvidenceLink',
          entityId: link.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });
      
      return link;
    },
  })
);

builder.mutationField('challengeSource', (t) =>
  t.prismaField({
    type: 'SourceChallenge',
    args: {
      input: t.arg({ type: ChallengeSourceInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const challenge = await ctx.prisma.sourceChallenge.create({
        ...query,
        data: {
          evidenceLinkId: args.input.evidenceLinkId,
          challengeType: args.input.challengeType,
          description: args.input.description,
          createdById: ctx.userId,
        },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'challenge_source',
          entityType: 'SourceChallenge',
          entityId: challenge.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });

      return challenge;
    },
  })
);

// Query for evidence link (for dedicated page)
builder.queryField('evidenceLink', (t) =>
  t.prismaField({
    type: 'EvidenceLink',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.evidenceLink.findUnique({
        ...query,
        where: { id: args.id },
      }),
  })
);

// Query for source challenge (for detailed view)
builder.queryField('sourceChallenge', (t) =>
  t.prismaField({
    type: 'SourceChallenge',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.sourceChallenge.findUnique({
        ...query,
        where: { id: args.id },
      }),
  })
);

// Create challenge response
builder.mutationField('createChallengeResponse', (t) =>
  t.prismaField({
    type: 'ChallengeResponse',
    args: {
      input: t.arg({ type: CreateChallengeResponseInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // Must be authenticated
      if (!ctx.userId) {
        throw new Error('Must be authenticated to respond to challenges');
      }

      // Check user is verified
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { authLevel: true },
      });
      if (!user || user.authLevel === 'ANONYMOUS') {
        throw new Error('Must be verified to respond to challenges');
      }

      // Validate challenge exists
      const challenge = await ctx.prisma.sourceChallenge.findUnique({
        where: { id: args.input.challengeId },
      });
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Validate depth (max 2 levels)
      if (args.input.parentId) {
        const parent = await ctx.prisma.challengeResponse.findUnique({
          where: { id: args.input.parentId },
          select: { parentId: true, challengeId: true },
        });
        if (!parent) {
          throw new Error('Parent response not found');
        }
        if (parent.challengeId !== args.input.challengeId) {
          throw new Error('Parent response belongs to different challenge');
        }
        if (parent.parentId) {
          throw new Error('Maximum response depth (2 levels) exceeded');
        }
      }

      // Create the response
      const response = await ctx.prisma.challengeResponse.create({
        ...query,
        data: {
          challengeId: args.input.challengeId,
          parentId: args.input.parentId,
          content: args.input.content,
          evidenceLinkId: args.input.evidenceLinkId,
          createdById: ctx.userId,
        },
      });

      // Auto-update challenge status to DISCUSSED if it was OPEN
      if (challenge.status === 'OPEN') {
        await ctx.prisma.sourceChallenge.update({
          where: { id: challenge.id },
          data: { status: 'DISCUSSED' },
        });
      }

      // Log event
      await ctx.prisma.event.create({
        data: {
          eventType: 'create_challenge_response',
          entityType: 'ChallengeResponse',
          entityId: response.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });

      return response;
    },
  })
);

// Acknowledge challenge (evidence poster accepts the challenge has merit)
builder.mutationField('acknowledgeChallenge', (t) =>
  t.prismaField({
    type: 'SourceChallenge',
    args: {
      challengeId: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.userId) {
        throw new Error('Must be authenticated');
      }

      // Get the challenge and its evidence link
      const challenge = await ctx.prisma.sourceChallenge.findUnique({
        where: { id: args.challengeId },
        include: {
          evidenceLink: {
            select: { createdById: true },
          },
        },
      });

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Only the evidence poster can acknowledge
      if (challenge.evidenceLink.createdById !== ctx.userId) {
        throw new Error('Only the evidence poster can acknowledge a challenge');
      }

      const updated = await ctx.prisma.sourceChallenge.update({
        ...query,
        where: { id: args.challengeId },
        data: { status: 'ACKNOWLEDGED' },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'acknowledge_challenge',
          entityType: 'SourceChallenge',
          entityId: challenge.id,
          payload: { previousStatus: challenge.status },
          userId: ctx.userId,
        },
      });

      return updated;
    },
  })
);

// Retract evidence (poster withdraws/corrects the evidence)
builder.mutationField('retractEvidence', (t) =>
  t.prismaField({
    type: 'EvidenceLink',
    args: {
      evidenceLinkId: t.arg.string({ required: true }),
      reason: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.userId) {
        throw new Error('Must be authenticated');
      }

      const evidenceLink = await ctx.prisma.evidenceLink.findUnique({
        where: { id: args.evidenceLinkId },
        select: { createdById: true },
      });

      if (!evidenceLink) {
        throw new Error('Evidence link not found');
      }

      // Only the evidence poster can retract
      if (evidenceLink.createdById !== ctx.userId) {
        throw new Error('Only the evidence poster can retract evidence');
      }

      // Update all open challenges to RETRACTED
      await ctx.prisma.sourceChallenge.updateMany({
        where: {
          evidenceLinkId: args.evidenceLinkId,
          status: { in: ['OPEN', 'DISCUSSED', 'ACKNOWLEDGED'] },
        },
        data: { status: 'RETRACTED' },
      });

      // Return the evidence link
      const link = await ctx.prisma.evidenceLink.findUnique({
        ...query,
        where: { id: args.evidenceLinkId },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'retract_evidence',
          entityType: 'EvidenceLink',
          entityId: args.evidenceLinkId,
          payload: { reason: args.reason },
          userId: ctx.userId,
        },
      });

      return link!;
    },
  })
);

// Flag challenge as confirmed error (moderator only - for now anyone with STRONG_ID)
builder.mutationField('flagChallenge', (t) =>
  t.prismaField({
    type: 'SourceChallenge',
    args: {
      challengeId: t.arg.string({ required: true }),
      reason: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.userId) {
        throw new Error('Must be authenticated');
      }

      // Check user has STRONG_ID (moderator level)
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { authLevel: true },
      });
      if (!user || user.authLevel !== 'STRONG_ID') {
        throw new Error('Only moderators (STRONG_ID) can flag challenges');
      }

      const challenge = await ctx.prisma.sourceChallenge.findUnique({
        where: { id: args.challengeId },
      });

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      const updated = await ctx.prisma.sourceChallenge.update({
        ...query,
        where: { id: args.challengeId },
        data: { status: 'FLAGGED' },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'flag_challenge',
          entityType: 'SourceChallenge',
          entityId: challenge.id,
          payload: { reason: args.reason, previousStatus: challenge.status },
          userId: ctx.userId,
        },
      });

      return updated;
    },
  })
);
