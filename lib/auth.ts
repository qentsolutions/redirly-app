import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "./prisma";

/**
 * Système d'authentification simplifié inspiré de BetterAuth
 * Gère l'inscription, connexion, sessions et tokens
 */

// Configuration
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 jours en millisecondes

// Interface pour l'utilisateur authentifié
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Hache un mot de passe avec bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Crée un nouvel utilisateur
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
 * Trouve un utilisateur par email
 */
export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

/**
 * Crée une nouvelle session pour un utilisateur
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
 * Valide une session par token
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

  // Vérifie si la session n'est pas expirée
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

/**
 * Supprime une session (logout)
 */
export async function deleteSession(token: string) {
  await db.session.delete({
    where: { token },
  });
}

/**
 * Supprime toutes les sessions expirées
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
 * Authentifie un utilisateur avec email et mot de passe
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
