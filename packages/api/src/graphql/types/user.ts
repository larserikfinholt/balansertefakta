import { builder } from '../builder.js';

// UserStance enums
builder.enumType('DescriptiveAssessment', {
  values: ['LIKELY_TRUE', 'POSSIBLY_TRUE', 'UNCERTAIN', 'POSSIBLY_FALSE', 'LIKELY_FALSE'] as const,
});

builder.enumType('NormativePreference', {
  values: ['STRONGLY_SUPPORT', 'SUPPORT', 'NEUTRAL', 'OPPOSE', 'STRONGLY_OPPOSE'] as const,
});

builder.enumType('JustificationType', {
  values: ['DATA_BASED', 'VALUE_BASED', 'RISK_BASED'] as const,
});

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

// UserStance type - split into descriptive vs normative assessment
builder.prismaObject('UserStance', {
  fields: (t) => ({
    id: t.exposeID('id'),
    descriptiveAssessment: t.expose('descriptiveAssessment', {
      type: 'DescriptiveAssessment',
      nullable: true,
    }),
    normativePreference: t.expose('normativePreference', {
      type: 'NormativePreference',
      nullable: true,
    }),
    justifications: t.expose('justifications', {
      type: ['JustificationType'],
    }),
    note: t.exposeString('note', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    question: t.relation('question'),
    user: t.relation('user'),
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

// UserStance input
const SetUserStanceInput = builder.inputType('SetUserStanceInput', {
  fields: (t) => ({
    questionId: t.string({ required: true }),
    descriptiveAssessment: t.field({ type: 'DescriptiveAssessment' }),
    normativePreference: t.field({ type: 'NormativePreference' }),
    justifications: t.field({ type: ['JustificationType'] }),
    note: t.string(),
  }),
});

// Query for user's stance on a question
builder.queryField('userStance', (t) =>
  t.prismaField({
    type: 'UserStance',
    nullable: true,
    args: {
      questionId: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      if (!ctx.userId) return null;

      return ctx.prisma.userStance.findUnique({
        ...query,
        where: {
          userId_questionId: {
            userId: ctx.userId,
            questionId: args.questionId,
          },
        },
      });
    },
  })
);

// Query for all stances on a question
builder.queryField('questionStances', (t) =>
  t.prismaField({
    type: ['UserStance'],
    args: {
      questionId: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.userStance.findMany({
        ...query,
        where: { questionId: args.questionId },
        orderBy: { createdAt: 'desc' },
      }),
  })
);

// Set user stance mutation (upsert)
builder.mutationField('setUserStance', (t) =>
  t.prismaField({
    type: 'UserStance',
    args: {
      input: t.arg({ type: SetUserStanceInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.userId) {
        throw new Error('Must be authenticated to set stance');
      }

      const stance = await ctx.prisma.userStance.upsert({
        ...query,
        where: {
          userId_questionId: {
            userId: ctx.userId,
            questionId: args.input.questionId,
          },
        },
        create: {
          userId: ctx.userId,
          questionId: args.input.questionId,
          descriptiveAssessment: args.input.descriptiveAssessment,
          normativePreference: args.input.normativePreference,
          justifications: args.input.justifications ?? [],
          note: args.input.note,
        },
        update: {
          descriptiveAssessment: args.input.descriptiveAssessment,
          normativePreference: args.input.normativePreference,
          justifications: args.input.justifications ?? [],
          note: args.input.note,
        },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'set_user_stance',
          entityType: 'UserStance',
          entityId: stance.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });

      return stance;
    },
  })
);
