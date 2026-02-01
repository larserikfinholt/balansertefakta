import { prisma } from '../db/client.js';
import { verifyToken } from '../lib/auth.js';

export interface Context {
  prisma: typeof prisma;
  userId?: string;
  authLevel: 'ANONYMOUS' | 'VERIFIED' | 'STRONG_ID';
}

export interface ContextRequest {
  headers: {
    authorization?: string;
  };
}

export async function createContext(req?: ContextRequest): Promise<Context> {
  const authHeader = req?.headers?.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (payload) {
      return {
        prisma,
        userId: payload.userId,
        authLevel: payload.authLevel as Context['authLevel'],
      };
    }
  }

  return {
    prisma,
    authLevel: 'ANONYMOUS',
  };
}
