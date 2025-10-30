import { z } from "zod";

/**
 * Validation schemas with Zod for forms and API
 */

// Signup schema
export const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters"),
  name: z
    .string()
    .min(2, "Name must contain at least 2 characters")
    .optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

// Organization creation schema
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must contain at least 2 characters")
    .max(100),
  description: z.string().max(500).optional(),
});

// Link creation schema
export const createLinkSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  originalUrl: z.string().url("Invalid URL"),
  customDomain: z.string().url("Invalid domain").optional(),
});

// Link update schema
export const updateLinkSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  originalUrl: z.string().url("Invalid URL").optional(),
  isActive: z.boolean().optional(),
});

// TypeScript types extracted from schemas
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
