import { cookies } from "next/headers";
import { validateSession } from "./auth";

const SESSION_COOKIE_NAME = "session_token";

/**
 * Récupère l'utilisateur actuel depuis la session
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await validateSession(token);
  return session?.user || null;
}

/**
 * Définit le cookie de session
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    path: "/",
  });
}

/**
 * Supprime le cookie de session
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Récupère le token de session actuel
 */
export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}
