import { builder } from '../builder.js';

// User type
builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    displayName: t.exposeString('displayName', { nullable: true }),
    authLevel: t.exposeString('authLevel'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    contributionBudget: t.exposeInt('contributionBudget'),
    qualityScore: t.exposeFloat('qualityScore'),
  }),
});

// Summary type
builder.prismaObject('Summary', {
  fields: (t) => ({
    id: t.exposeID('id'),
    version: t.exposeInt('version'),
    proPoints: t.expose('proPoints', { type: 'JSON' }),
    contraPoints: t.expose('contraPoints', { type: 'JSON' }),
    dataDisagreements: t.exposeStringList('dataDisagreements'),
    interpretationDisagreements: t.exposeStringList('interpretationDisagreements'),
    valueDisagreements: t.exposeStringList('valueDisagreements'),
    openQuestions: t.exposeStringList('openQuestions'),
    status: t.expose('status', { type: 'ContentStatus' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    question: t.relation('question'),
    createdBy: t.relation('createdBy', { nullable: true }),
  }),
});

// Event type (for audit trail)
builder.prismaObject('Event', {
  fields: (t) => ({
    id: t.exposeID('id'),
    eventType: t.exposeString('eventType'),
    entityType: t.exposeString('entityType'),
    entityId: t.exposeString('entityId'),
    payload: t.expose('payload', { type: 'JSON' }),
    userId: t.exposeString('userId', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

// JSON scalar for complex objects
builder.scalarType('JSON', {
  serialize: (value) => value,
  parseValue: (value) => value,
});

// Summary input
const CreateSummaryInput = builder.inputType('CreateSummaryInput', {
  fields: (t) => ({
    questionId: t.string({ required: true }),
    proPoints: t.field({ type: 'JSON', required: true }),
    contraPoints: t.field({ type: 'JSON', required: true }),
    dataDisagreements: t.stringList(),
    interpretationDisagreements: t.stringList(),
    valueDisagreements: t.stringList(),
    openQuestions: t.stringList(),
  }),
});

// Query for events (audit trail)
builder.queryField('events', (t) =>
  t.prismaField({
    type: ['Event'],
    args: {
      entityType: t.arg.string(),
      entityId: t.arg.string(),
      limit: t.arg.int({ defaultValue: 50 }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.event.findMany({
        ...query,
        where: {
          ...(args.entityType && { entityType: args.entityType }),
          ...(args.entityId && { entityId: args.entityId }),
        },
        orderBy: { createdAt: 'desc' },
        take: args.limit ?? 50,
      }),
  })
);

// Get summaries for a question
builder.queryField('summaries', (t) =>
  t.prismaField({
    type: ['Summary'],
    args: {
      questionId: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.summary.findMany({
        ...query,
        where: { questionId: args.questionId },
        orderBy: { version: 'desc' },
      }),
  })
);

// Create summary mutation
builder.mutationField('createSummary', (t) =>
  t.prismaField({
    type: 'Summary',
    args: {
      input: t.arg({ type: CreateSummaryInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // Get the latest version for this question
      const latestSummary = await ctx.prisma.summary.findFirst({
        where: { questionId: args.input.questionId },
        orderBy: { version: 'desc' },
      });
      
      const nextVersion = (latestSummary?.version ?? 0) + 1;
      
      // Validate summary structure (3-7 points each)
      const proPoints = args.input.proPoints as unknown[];
      const contraPoints = args.input.contraPoints as unknown[];
      
      if (!Array.isArray(proPoints) || proPoints.length < 3 || proPoints.length > 7) {
        throw new Error('Pro-siden must have 3-7 points');
      }
      if (!Array.isArray(contraPoints) || contraPoints.length < 3 || contraPoints.length > 7) {
        throw new Error('Contra-siden must have 3-7 points');
      }
      
      const summary = await ctx.prisma.summary.create({
        ...query,
        data: {
          questionId: args.input.questionId,
          version: nextVersion,
          proPoints: args.input.proPoints,
          contraPoints: args.input.contraPoints,
          dataDisagreements: args.input.dataDisagreements ?? [],
          interpretationDisagreements: args.input.interpretationDisagreements ?? [],
          valueDisagreements: args.input.valueDisagreements ?? [],
          openQuestions: args.input.openQuestions ?? [],
          createdById: ctx.userId,
        },
      });
      
      await ctx.prisma.event.create({
        data: {
          eventType: 'create_summary',
          entityType: 'Summary',
          entityId: summary.id,
          payload: { ...args.input, version: nextVersion },
          userId: ctx.userId,
        },
      });
      
      return summary;
    },
  })
);
