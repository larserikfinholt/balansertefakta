import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { schema } from './graphql/schema.js';
import { createContext } from './graphql/context.js';

const server = new ApolloServer({
  schema,
  introspection: true,
});

const PORT = parseInt(process.env['PORT'] ?? '4000', 10);

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
  context: async ({ req }) => createContext(req),
});

console.log(`🚀 Balansertefakta API ready at ${url}`);
console.log(`📊 GraphQL Playground: ${url}`);
