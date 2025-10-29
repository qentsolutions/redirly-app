import { nanoid, customAlphabet } from "nanoid";
import { db } from "./prisma";

/**
 * Génère un code court unique pour les liens
 * Utilise un alphabet sans caractères ambigus
 */
const generateShortCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
);

/**
 * Crée un code court unique (vérifie l'unicité en DB)
 */
export async function createUniqueShortCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const shortCode = generateShortCode();

    // Vérifie si le code existe déjà
    const existing = await db.link.findUnique({
      where: { shortCode },
    });

    if (!existing) {
      return shortCode;
    }

    attempts++;
  }

  throw new Error("Unable to generate unique short code");
}

/**
 * Valide une URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Génère un slug unique pour une organisation
 */
export async function createUniqueSlug(baseName: string): Promise<string> {
  // Nettoie le nom pour créer un slug
  let slug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Vérifie l'unicité
  let counter = 0;
  let uniqueSlug = slug;

  while (true) {
    const existing = await db.organization.findUnique({
      where: { slug: uniqueSlug },
    });

    if (!existing) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }
}

/**
 * Construit l'URL complète du lien court
 */
export function buildShortUrl(
  shortCode: string,
  customDomain?: string | null
): string {
  const baseUrl =
    customDomain || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/${shortCode}`;
}

