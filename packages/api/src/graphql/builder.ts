import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import RelayPlugin from '@pothos/plugin-relay';
import ValidationPlugin from '@pothos/plugin-validation';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import { DateTimeResolver } from 'graphql-scalars';
import { prisma } from '../db/client.js';
import type { Context } from './context.js';

export const builder = new SchemaBuilder<{
  Context: Context;
  PrismaTypes: PrismaTypes;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [PrismaPlugin, RelayPlugin, ValidationPlugin],
  prisma: {
    client: prisma,
    filterConnectionTotalCount: true,
  },
  relay: {
    clientMutationId: 'omit',
    cursorType: 'String',
  },
});

// Add DateTime scalar
builder.addScalarType('DateTime', DateTimeResolver);

// Query root
builder.queryType({});

// Mutation root
builder.mutationType({});
