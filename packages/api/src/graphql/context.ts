import { prisma } from '../db/client.js';

export interface Context {
  prisma: typeof prisma;
  userId?: string;
  authLevel: 'ANONYMOUS' | 'VERIFIED' | 'STRONG_ID';
}

export function createContext(): Context {
  return {
    prisma,
    authLevel: 'ANONYMOUS', // Default, will be set by auth middleware
  };
}
