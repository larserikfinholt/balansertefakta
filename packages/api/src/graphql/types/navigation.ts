import { builder } from '../builder.js';

// Topic type
builder.prismaObject('Topic', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description', { nullable: true }),
    slug: t.exposeString('slug'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    subtopics: t.relation('subtopics'),
    createdBy: t.relation('createdBy', { nullable: true }),
  }),
});

// Subtopic type
builder.prismaObject('Subtopic', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description', { nullable: true }),
    slug: t.exposeString('slug'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    topic: t.relation('topic'),
    questions: t.relation('questions'),
    createdBy: t.relation('createdBy', { nullable: true }),
  }),
});

// QuestionStatus enum
builder.enumType('QuestionStatus', {
  values: ['DRAFT', 'OPEN', 'BALANCED', 'MATURE', 'ARCHIVED'] as const,
});

// Question type
builder.prismaObject('Question', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description', { nullable: true }),
    slug: t.exposeString('slug'),
    status: t.expose('status', { type: 'QuestionStatus' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    subtopic: t.relation('subtopic'),
    createdBy: t.relation('createdBy', { nullable: true }),
    claims: t.relation('questionClaims'),
    measures: t.relation('questionMeasures'),
    summaries: t.relation('summaries'),
    
    // Computed field: is this question balanced?
    isBalanced: t.boolean({
      resolve: async (question, _args, ctx) => {
        const claims = await ctx.prisma.questionClaim.findMany({
          where: { questionId: question.id },
          include: { claim: true },
        });
        
        // Check if all linked claims have both pro and contra arguments
        for (const qc of claims) {
          if (qc.claim.proArgumentCount === 0 || qc.claim.contraArgumentCount === 0) {
            return false;
          }
        }
        return claims.length > 0;
      },
    }),
  }),
});

// Queries
builder.queryField('topics', (t) =>
  t.prismaField({
    type: ['Topic'],
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.topic.findMany({
        ...query,
        orderBy: { title: 'asc' },
      }),
  })
);

builder.queryField('topic', (t) =>
  t.prismaField({
    type: 'Topic',
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.topic.findUnique({
        ...query,
        where: { slug: args.slug },
      }),
  })
);

builder.queryField('question', (t) =>
  t.prismaField({
    type: 'Question',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.question.findUnique({
        ...query,
        where: { id: args.id },
      }),
  })
);

// Input types for mutations
const CreateTopicInput = builder.inputType('CreateTopicInput', {
  fields: (t) => ({
    title: t.string({ required: true }),
    description: t.string(),
    slug: t.string({ required: true }),
  }),
});

const CreateSubtopicInput = builder.inputType('CreateSubtopicInput', {
  fields: (t) => ({
    topicId: t.string({ required: true }),
    title: t.string({ required: true }),
    description: t.string(),
    slug: t.string({ required: true }),
  }),
});

const CreateQuestionInput = builder.inputType('CreateQuestionInput', {
  fields: (t) => ({
    subtopicId: t.string({ required: true }),
    title: t.string({ required: true }),
    description: t.string(),
    slug: t.string({ required: true }),
  }),
});

// Mutations
builder.mutationField('createTopic', (t) =>
  t.prismaField({
    type: 'Topic',
    args: {
      input: t.arg({ type: CreateTopicInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const topic = await ctx.prisma.topic.create({
        ...query,
        data: {
          title: args.input.title,
          description: args.input.description,
          slug: args.input.slug,
          createdById: ctx.userId,
        },
      });
      
      // Log event
      await ctx.prisma.event.create({
        data: {
          eventType: 'create_topic',
          entityType: 'Topic',
          entityId: topic.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });
      
      return topic;
    },
  })
);

builder.mutationField('createSubtopic', (t) =>
  t.prismaField({
    type: 'Subtopic',
    args: {
      input: t.arg({ type: CreateSubtopicInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const subtopic = await ctx.prisma.subtopic.create({
        ...query,
        data: {
          topicId: args.input.topicId,
          title: args.input.title,
          description: args.input.description,
          slug: args.input.slug,
          createdById: ctx.userId,
        },
      });
      
      await ctx.prisma.event.create({
        data: {
          eventType: 'create_subtopic',
          entityType: 'Subtopic',
          entityId: subtopic.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });
      
      return subtopic;
    },
  })
);

builder.mutationField('createQuestion', (t) =>
  t.prismaField({
    type: 'Question',
    args: {
      input: t.arg({ type: CreateQuestionInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const question = await ctx.prisma.question.create({
        ...query,
        data: {
          subtopicId: args.input.subtopicId,
          title: args.input.title,
          description: args.input.description,
          slug: args.input.slug,
          createdById: ctx.userId,
        },
      });
      
      await ctx.prisma.event.create({
        data: {
          eventType: 'create_question',
          entityType: 'Question',
          entityId: question.id,
          payload: args.input,
          userId: ctx.userId,
        },
      });
      
      return question;
    },
  })
);
