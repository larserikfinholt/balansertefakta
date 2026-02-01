# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Balansertefakta is a hierarchical, balance-focused social network for structured societal discussions. Core principle: "Ingen påstand uten motstemme" (No claim without opposition) - every claim must have both pro and contra arguments.

## Tech Stack

- **Monorepo**: pnpm workspaces with 3 packages (api, web, e2e)
- **Backend**: Apollo Server v4, Pothos GraphQL schema builder, Prisma ORM, PostgreSQL 16
- **Frontend**: React 19, Vite v6, Apollo Client, React Router v7
- **Testing**: Vitest (unit), Playwright (e2e)
- **Runtime**: Node >=20.0.0, pnpm >=9.15.0

## Commands

All commands run from root:

```bash
# Development
pnpm dev              # Run API (port 4000) & web (port 3000) in parallel
pnpm dev:api          # API only
pnpm dev:web          # Web only

# Building & Quality
pnpm build            # TypeScript compile all packages
pnpm lint             # ESLint check
pnpm typecheck        # TypeScript type checking

# Testing
pnpm test             # Vitest unit tests (api package)
pnpm test:e2e         # Playwright e2e (auto-starts servers)

# Database (from root, affects api package)
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Create & apply migrations
pnpm db:studio        # Open Prisma Studio UI
pnpm db:seed          # Seed sample data
```

Single package commands:
```bash
pnpm --filter @balansertefakta/api test:watch   # Watch mode tests
pnpm --filter @balansertefakta/web codegen      # GraphQL code generation
pnpm --filter @balansertefakta/e2e test:ui      # Playwright UI mode
```

## Architecture

### Data Model: DAG-Based Content
Content (Claims, Measures, Arguments) is stored as a Directed Acyclic Graph. The same content can be referenced from multiple Questions/Subtopics, avoiding duplication.

### Navigation Hierarchy
**Topic** → **Subtopic** → **Question** (for browsing only; underlying content is DAG)

### Balance Enforcement
- Every Question/Claim requires both pro (≥1) and contra (≥1) arguments
- Status values: `DRAFT | OPEN | BALANCED | MATURE | ARCHIVED`
- GraphQL resolver computes `isBalanced` by checking linked claims

### Evidence Model (Multi-Level)
**Domain** → **Outlet** → **Artifact** → **Extract** → **EvidenceLink**

### GraphQL with Pothos
Schema builder pattern (not SDL-first) with plugins:
- Prisma plugin for automatic type generation
- Relay plugin for cursor-based pagination
- Validation plugin for input validation

## Package Structure

```
packages/
├── api/                    # GraphQL API backend
│   ├── src/
│   │   ├── index.ts       # Apollo Server entry
│   │   ├── graphql/
│   │   │   ├── builder.ts # Pothos schema builder
│   │   │   ├── schema.ts  # Schema assembly
│   │   │   └── types/     # Type definitions (navigation, content, evidence, user)
│   │   └── db/client.ts   # Prisma client singleton
│   └── prisma/
│       ├── schema.prisma  # Data model
│       └── seed.ts        # Sample data
├── web/                    # React frontend
│   ├── src/
│   │   ├── App.tsx        # Route definitions
│   │   ├── pages/         # Page components
│   │   └── lib/
│   │       ├── apollo.ts  # Apollo client config
│   │       └── queries.ts # GraphQL queries
│   └── vite.config.ts     # Proxy: /graphql → localhost:4000
└── e2e/                    # Playwright tests
    └── playwright.config.ts # Auto-starts API & web servers
```

## Key Conventions

- **Package names**: `@balansertefakta/[package-name]`
- **Database slugs**: kebab-case (e.g., `menneskelig-aktivitet`)
- **Enum values**: UPPER_SNAKE_CASE
- **IDs**: CUID (not UUID)
- **ESM imports**: Use `.js` extension for local imports (tsx/ts → js in dist)

## Database Setup

```bash
docker-compose up -d                    # Start PostgreSQL (port 5433)
pnpm db:generate && pnpm db:push        # Initialize schema
pnpm db:seed                            # Optional: seed sample data
```

Environment (packages/api/.env):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/balansertefakta?schema=public"
PORT=4000
```

## GraphQL Development

Adding types:
1. Create/edit files in `packages/api/src/graphql/types/`
2. Use Pothos builder pattern (see existing files for examples)
3. Import in `packages/api/src/graphql/schema.ts`
4. Restart API dev server

Resolver pattern:
```typescript
resolve: (query, root, args, ctx) => ctx.prisma.model.findMany({...query})
```
