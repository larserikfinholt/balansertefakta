import { builder } from '../builder.js';
import { hashPassword, comparePassword, signToken } from '../../lib/auth.js';

// Input types
const RegisterInput = builder.inputType('RegisterInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    displayName: t.string({ required: true }),
  }),
});

const LoginInput = builder.inputType('LoginInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

// Define the shape of auth user data
interface AuthUserShape {
  id: string;
  email: string | null;
  displayName: string | null;
  authLevel: string;
}

interface AuthPayloadShape {
  token: string;
  user: AuthUserShape;
}

// Auth user type for responses
const AuthUser = builder.objectRef<AuthUserShape>('AuthUser').implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    email: t.exposeString('email', { nullable: true }),
    displayName: t.exposeString('displayName', { nullable: true }),
    authLevel: t.exposeString('authLevel'),
  }),
});

// Auth payload response type
const AuthPayload = builder.objectRef<AuthPayloadShape>('AuthPayload').implement({
  fields: (t) => ({
    token: t.exposeString('token'),
    user: t.field({
      type: AuthUser,
      resolve: (parent) => parent.user,
    }),
  }),
});

// Add email field to User type (it wasn't exposed before)
builder.prismaObjectField('User', 'email', (t) =>
  t.exposeString('email', { nullable: true })
);

// Query: me - get current user
builder.queryField('me', (t) =>
  t.prismaField({
    type: 'User',
    nullable: true,
    resolve: async (query, _root, _args, ctx) => {
      if (!ctx.userId) return null;
      return ctx.prisma.user.findUnique({
        ...query,
        where: { id: ctx.userId },
      });
    },
  })
);

// Mutation: register
builder.mutationField('register', (t) =>
  t.field({
    type: AuthPayload,
    args: {
      input: t.arg({ type: RegisterInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const { email, password, displayName } = args.input;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Validate password length
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Check if email already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await ctx.prisma.user.create({
        data: {
          email,
          displayName,
          passwordHash,
          authLevel: 'VERIFIED',
        },
      });

      // Generate token
      const token = signToken({ userId: user.id, authLevel: user.authLevel });

      // Log event
      await ctx.prisma.event.create({
        data: {
          eventType: 'user_registered',
          entityType: 'User',
          entityId: user.id,
          payload: { email, displayName },
          userId: user.id,
        },
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          authLevel: user.authLevel,
        },
      };
    },
  })
);

// Mutation: login
builder.mutationField('login', (t) =>
  t.field({
    type: AuthPayload,
    args: {
      input: t.arg({ type: LoginInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const { email, password } = args.input;

      // Find user by email
      const user = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.passwordHash) {
        throw new Error('Invalid email or password');
      }

      // Compare password
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = signToken({ userId: user.id, authLevel: user.authLevel });

      // Log event
      await ctx.prisma.event.create({
        data: {
          eventType: 'user_login',
          entityType: 'User',
          entityId: user.id,
          payload: { email },
          userId: user.id,
        },
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          authLevel: user.authLevel,
        },
      };
    },
  })
);
