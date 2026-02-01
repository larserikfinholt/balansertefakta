import { builder } from '../builder.js';

// Enums
builder.enumType('ClaimType', {
  values: ['FACTUAL', 'INTERPRETIVE', 'VALUE', 'PREDICTIVE'] as const,
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
