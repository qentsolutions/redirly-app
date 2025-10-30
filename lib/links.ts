import { nanoid, customAlphabet } from "nanoid";
import { db } from "./prisma";

/**
 * Generate unique short code for links
 * Uses an alphabet without ambiguous characters
 */
const generateShortCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
);

/**
 * Create unique short code (checks uniqueness in DB)
 */
export async function createUniqueShortCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const shortCode = generateShortCode();

    // Check if the code already exists
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
 * Validate a URL
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
 * Generate unique slug for an organization
 */
export async function createUniqueSlug(baseName: string): Promise<string> {
  // Clean the name to create a slug
  let slug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Check uniqueness
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
 * Build the complete URL of the short link
 */
export function buildShortUrl(
  shortCode: string,
  customDomain?: string | null
): string {
  const baseUrl =
    customDomain || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/${shortCode}`;
}

