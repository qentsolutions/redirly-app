import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "./prisma";

/**
 * Simplified authentication system inspired by BetterAuth
 * Manages registration, login, sessions and tokens
 */

// Configuration
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Interface for authenticated user
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Hash a password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  name?: string
) {
  const hashedPassword = await hashPassword(password);

  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
    },
  });

  return user;
}

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string) {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const session = await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return session;
}

/**
 * Validate a session by token
 */
export async function validateSession(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check if the session is not expired
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string) {
  await db.session.delete({
    where: { token },
  });
}

/**
 * Delete all expired sessions
 */
export async function cleanupExpiredSessions() {
  await db.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return user;
}
