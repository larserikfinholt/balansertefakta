import { builder } from '../builder.js';

// Enums
builder.enumType('ClaimType', {
  values: ['EMPIRICAL', 'CAUSAL', 'PROGNOSTIC', 'NORMATIVE', 'DEFINITIONAL'] as const,
});

builder.enumType('TemporalScope', {
  values: ['HISTORICAL', 'RECENT', 'CURRENT', 'SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM', 'UNSPECIFIED'] as const,
});

builder.enumType('GeographicScope', {
  values: ['GLOBAL', 'CONTINENTAL', 'NATIONAL', 'REGIONAL', 'LOCAL', 'UNSPECIFIED'] as const,
});

builder.enumType('DisagreementType', {
  values: ['DATA', 'INTERPRETATION', 'VALUES_OR_RISK', 'DEFINITIONS', 'SCOPE'] as const,
});

builder.enumType('ContentStatus', {
  values: ['DRAFT', 'PROPOSED', 'ACCEPTED', 'CHALLENGED', 'REJECTED', 'ARCHIVED'] as const,
});

builder.enumType('ArgumentType', {
  values: ['PRO', 'CONTRA'] as const,
});

builder.enumType('ArgumentStrength', {
  values: ['LOW', 'MEDIUM', 'HIGH'] as const,
});

// Scope type - explicit scoping for content
builder.prismaObject('Scope', {
  fields: (t) => ({
    id: t.exposeID('id'),
    temporalScope: t.expose('temporalScope', { type: 'TemporalScope' }),
    geographicScope: t.expose('geographicScope', { type: 'GeographicScope' }),
    systemBoundary: t.exposeString('systemBoundary'),
    assumptions: t.exposeString('assumptions', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    createdBy: t.relation('createdBy', { nullable: true }),
    question: t.relation('question', { nullable: true }),
    claim: t.relation('claim', { nullable: true }),
    argument: t.relation('argument', { nullable: true }),
  }),
});

// Disagreement type - explicit disagreement tracking
builder.prismaObject('Disagreement', {
  fields: (t) => ({
    id: t.exposeID('id'),
    description: t.exposeString('description'),
    disagreementType: t.expose('disagreementType', { type: 'DisagreementType' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    createdBy: t.relation('createdBy', { nullable: true }),
    question: t.relation('question', { nullable: true }),
    claim: t.relation('claim', { nullable: true }),
  }),
});

// Claim type
builder.prismaObject('Claim', {
  fields: (t) => ({
    id: t.exposeID('id'),
    statement: t.exposeString('statement'),
    context: t.exposeString('context', { nullable: true }),
    claimType: t.expose('claimType', { type: 'ClaimType' }),
    status: t.expose('status', { type: 'ContentStatus' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    createdBy: t.relation('createdBy', { nullable: true }),
    arguments: t.relation('arguments'),
    evidenceLinks: t.relation('evidenceLinks'),
    scope: t.relation('scope', { nullable: true }),
    disagreements: t.relation('disagreements'),
    proArgumentCount: t.exposeInt('proArgumentCount'),
    contraArgumentCount: t.exposeInt('contraArgumentCount'),

    // Is this claim balanced (has both pro and contra)?
    isBalanced: t.boolean({
      resolve: (claim) => claim.proArgumentCount > 0 && claim.contraArgumentCount > 0,
    }),
  }),
});

// QuestionClaim junction
builder.prismaObject('QuestionClaim', {
  fields: (t) => ({
    id: t.exposeID('id'),
    question: t.relation('question'),
    claim: t.relation('claim'),
    addedAt: t.expose('addedAt', { type: 'DateTime' }),
    addedBy: t.relation('addedBy', { nullable: true }),
  }),
});

// Measure type
builder.prismaObject('Measure', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description'),
    rationale: t.exposeString('rationale', { nullable: true }),
    status: t.expose('status', { type: 'ContentStatus' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    createdBy: t.relation('createdBy', { nullable: true }),
    arguments: t.relation('arguments'),
    evidenceLinks: t.relation('evidenceLinks'),
    proArgumentCount: t.exposeInt('proArgumentCount'),
    contraArgumentCount: t.exposeInt('contraArgumentCount'),
    isBalanced: t.boolean({
      resolve: (measure) => measure.proArgumentCount > 0 && measure.contraArgumentCount > 0,
    }),
  }),
});

// QuestionMeasure junction
builder.prismaObject('QuestionMeasure', {
  fields: (t) => ({
    id: t.exposeID('id'),
    question: t.relation('question'),
    measure: t.relation('measure'),
    addedAt: t.expose('addedAt', { type: 'DateTime' }),
    addedBy: t.relation('addedBy', { nullable: true }),
  }),
});

// Argument type
builder.prismaObject('Argument', {
  fields: (t) => ({
    id: t.exposeID('id'),
    content: t.exposeString('content'),
    argumentType: t.expose('argumentType', { type: 'ArgumentType' }),
    strength: t.expose('strength', { type: 'ArgumentStrength' }),
    status: t.expose('status', { type: 'ContentStatus' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    createdBy: t.relation('createdBy', { nullable: true }),
    claim: t.relation('claim', { nullable: true }),
    measure: t.relation('measure', { nullable: true }),
    counterpositions: t.relation('counterpositions'),
    evidenceLinks: t.relation('evidenceLinks'),
    scope: t.relation('scope', { nullable: true }),
  }),
});

// Counterposition type
builder.prismaObject('Counterposition', {
  fields: (t) => ({
    id: t.exposeID('id'),
    content: t.exposeString('content'),
    status: t.expose('status', { type: 'ContentStatus' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    argument: t.relation('argument'),
    createdBy: t.relation('createdBy', { nullable: true }),
    evidenceLinks: t.relation('evidenceLinks'),
  }),
});

// Input types
const CreateClaimInput = builder.inputType('CreateClaimInput', {
  fields: (t) => ({
    statement: t.string({ required: true }),
    context: t.string(),
    claimType: t.field({ type: 'ClaimType', required: true }),
  }),
});

const AddClaimToQuestionInput = builder.inputType('AddClaimToQuestionInput', {
  fields: (t) => ({
    questionId: t.string({ required: true }),
    claimId: t.string({ required: true }),
  }),
});

const CreateArgumentInput = builder.inputType('CreateArgumentInput', {
  fields: (t) => ({
    content: t.string({ required: true }),
    argumentType: t.field({ type: 'ArgumentType', required: true }),
    strength: t.field({ type: 'ArgumentStrength' }),
    claimId: t.string(),
    measureId: t.string(),
  }),
});

const CreateCounterpositionInput = builder.inputType('CreateCounterpositionInput', {
  fields: (t) => ({
    argumentId: t.string({ required: true }),
    content: t.string({ required: true }),
  }),
});

// Queries
builder.queryField('claim', (t) =>
  t.prismaField({
    type: 'Claim',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.claim.findUnique({
        ...query,
        where: { id: args.id },
      }),
  })
);

builder.queryField('claims', (t) =>
  t.prismaField({
    type: ['Claim'],
    args: {
      status: t.arg({ type: 'ContentStatus' }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.claim.findMany({
        ...query,
        where: args.status ? { status: args.status } : undefined,
        orderBy: { createdAt: 'desc' },
      }),
  })
);

// Mutations
builder.mutationField('createClaim', (t) =>
  t.prismaField({
    type: 'Claim',
    args: {
      input: t.arg({ type: CreateClaimInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const claim = await ctx.prisma.claim.create({
        ...query,
        data: {
          statement: args.input.statement,
          context: args.input.context,
          claimType: args.input.claimType,
          createdById: ctx.userId,
        },
      });
      
      await ctx.prisma.event.create({
        data: {
          eventType: 'create_claim',
          entityType: 'Claim',
          entityId: claim.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });
      
      return claim;
    },
  })
);

builder.mutationField('addClaimToQuestion', (t) =>
  t.prismaField({
    type: 'QuestionClaim',
    args: {
      input: t.arg({ type: AddClaimToQuestionInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const link = await ctx.prisma.questionClaim.create({
        ...query,
        data: {
          questionId: args.input.questionId,
          claimId: args.input.claimId,
          addedById: ctx.userId,
        },
      });
      
      await ctx.prisma.event.create({
        data: {
          eventType: 'link_claim_to_question',
          entityType: 'QuestionClaim',
          entityId: link.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });
      
      return link;
    },
  })
);

builder.mutationField('createArgument', (t) =>
  t.prismaField({
    type: 'Argument',
    args: {
      input: t.arg({ type: CreateArgumentInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // Validate: must have exactly one of claimId or measureId
      if (!args.input.claimId && !args.input.measureId) {
        throw new Error('Argument must be attached to either a claim or measure');
      }
      if (args.input.claimId && args.input.measureId) {
        throw new Error('Argument cannot be attached to both a claim and measure');
      }
      
      const argument = await ctx.prisma.argument.create({
        ...query,
        data: {
          content: args.input.content,
          argumentType: args.input.argumentType,
          strength: args.input.strength ?? 'MEDIUM',
          claimId: args.input.claimId,
          measureId: args.input.measureId,
          createdById: ctx.userId,
        },
      });
      
      // Update argument count on the parent
      if (args.input.claimId) {
        const field = args.input.argumentType === 'PRO' ? 'proArgumentCount' : 'contraArgumentCount';
        await ctx.prisma.claim.update({
          where: { id: args.input.claimId },
          data: { [field]: { increment: 1 } },
        });
      } else if (args.input.measureId) {
        const field = args.input.argumentType === 'PRO' ? 'proArgumentCount' : 'contraArgumentCount';
        await ctx.prisma.measure.update({
          where: { id: args.input.measureId },
          data: { [field]: { increment: 1 } },
        });
      }
      
      await ctx.prisma.event.create({
        data: {
          eventType: 'add_argument',
          entityType: 'Argument',
          entityId: argument.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });
      
      return argument;
    },
  })
);

builder.mutationField('createCounterposition', (t) =>
  t.prismaField({
    type: 'Counterposition',
    args: {
      input: t.arg({ type: CreateCounterpositionInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const counterposition = await ctx.prisma.counterposition.create({
        ...query,
        data: {
          argumentId: args.input.argumentId,
          content: args.input.content,
          createdById: ctx.userId,
        },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'add_counterposition',
          entityType: 'Counterposition',
          entityId: counterposition.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });

      return counterposition;
    },
  })
);

// Scope input types
const SetScopeInput = builder.inputType('SetScopeInput', {
  fields: (t) => ({
    temporalScope: t.field({ type: 'TemporalScope' }),
    geographicScope: t.field({ type: 'GeographicScope' }),
    systemBoundary: t.string({ required: true }),
    assumptions: t.string(),
    // Target - exactly one must be provided
    questionId: t.string(),
    claimId: t.string(),
    argumentId: t.string(),
  }),
});

// Disagreement input types
const CreateDisagreementInput = builder.inputType('CreateDisagreementInput', {
  fields: (t) => ({
    description: t.string({ required: true }),
    disagreementType: t.field({ type: 'DisagreementType', required: true }),
    // Target - exactly one must be provided
    questionId: t.string(),
    claimId: t.string(),
  }),
});

// Set scope mutation
builder.mutationField('setScope', (t) =>
  t.prismaField({
    type: 'Scope',
    args: {
      input: t.arg({ type: SetScopeInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // Validate: must have exactly one target
      const targets = [args.input.questionId, args.input.claimId, args.input.argumentId].filter(Boolean);
      if (targets.length !== 1) {
        throw new Error('Scope must be set on exactly one target (question, claim, or argument)');
      }

      // Upsert scope - create or update based on target
      const whereClause = args.input.questionId
        ? { questionId: args.input.questionId }
        : args.input.claimId
          ? { claimId: args.input.claimId }
          : { argumentId: args.input.argumentId };

      const existingScope = await ctx.prisma.scope.findFirst({
        where: whereClause,
      });

      let scope;
      if (existingScope) {
        scope = await ctx.prisma.scope.update({
          ...query,
          where: { id: existingScope.id },
          data: {
            temporalScope: args.input.temporalScope ?? 'UNSPECIFIED',
            geographicScope: args.input.geographicScope ?? 'UNSPECIFIED',
            systemBoundary: args.input.systemBoundary,
            assumptions: args.input.assumptions,
          },
        });
      } else {
        scope = await ctx.prisma.scope.create({
          ...query,
          data: {
            temporalScope: args.input.temporalScope ?? 'UNSPECIFIED',
            geographicScope: args.input.geographicScope ?? 'UNSPECIFIED',
            systemBoundary: args.input.systemBoundary,
            assumptions: args.input.assumptions,
            questionId: args.input.questionId,
            claimId: args.input.claimId,
            argumentId: args.input.argumentId,
            createdById: ctx.userId,
          },
        });
      }

      await ctx.prisma.event.create({
        data: {
          eventType: existingScope ? 'update_scope' : 'set_scope',
          entityType: 'Scope',
          entityId: scope.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });

      return scope;
    },
  })
);

// Create disagreement mutation
builder.mutationField('createDisagreement', (t) =>
  t.prismaField({
    type: 'Disagreement',
    args: {
      input: t.arg({ type: CreateDisagreementInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // Validate: must have exactly one target
      const targets = [args.input.questionId, args.input.claimId].filter(Boolean);
      if (targets.length !== 1) {
        throw new Error('Disagreement must be attached to exactly one target (question or claim)');
      }

      const disagreement = await ctx.prisma.disagreement.create({
        ...query,
        data: {
          description: args.input.description,
          disagreementType: args.input.disagreementType,
          questionId: args.input.questionId,
          claimId: args.input.claimId,
          createdById: ctx.userId,
        },
      });

      await ctx.prisma.event.create({
        data: {
          eventType: 'create_disagreement',
          entityType: 'Disagreement',
          entityId: disagreement.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });

      return disagreement;
    },
  })
);

// Query for disagreements on a question
builder.queryField('disagreements', (t) =>
  t.prismaField({
    type: ['Disagreement'],
    args: {
      questionId: t.arg.string(),
      claimId: t.arg.string(),
      type: t.arg({ type: 'DisagreementType' }),
    },
    resolve: (query, _root, args, ctx) => {
      const where: Record<string, unknown> = {};
      if (args.questionId) where.questionId = args.questionId;
      if (args.claimId) where.claimId = args.claimId;
      if (args.type) where.disagreementType = args.type;

      return ctx.prisma.disagreement.findMany({
        ...query,
        where,
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);
