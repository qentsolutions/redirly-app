import { z } from "zod";

/**
 * Schémas de validation avec Zod pour les formulaires et API
 */

// Schéma d'inscription
export const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .optional(),
});

// Schéma de connexion
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// Schéma de création d'organisation
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100),
  description: z.string().max(500).optional(),
});

// Schéma de création de lien
export const createLinkSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  originalUrl: z.string().url("URL invalide"),
  customDomain: z.string().url("Domaine invalide").optional(),
});

// Schéma de mise à jour de lien
export const updateLinkSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200).optional(),
  originalUrl: z.string().url("URL invalide").optional(),
  isActive: z.boolean().optional(),
});

// Types TypeScript extraits des schémas
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
