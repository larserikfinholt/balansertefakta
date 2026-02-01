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
  values: ['OPEN', 'ACCEPTED', 'REJECTED', 'DISPUTED'] as const,
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
        const openChallenges = await ctx.prisma.sourceChallenge.count({
          where: {
            evidenceLinkId: link.id,
            status: { in: ['OPEN', 'DISPUTED'] },
          },
        });
        return openChallenges > 0;
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
