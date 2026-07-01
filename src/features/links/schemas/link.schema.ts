import { z } from "zod";

export const createLinkSchema = z.object({
  title: z.string().trim().max(120).optional().or(z.literal("")),
  originalUrl: z.url("Please enter a valid URL"),
  customSlug: z
    .string()
    .trim()
    .min(3, "Custom slug must be at least 3 characters")
    .max(64, "Custom slug is too long")
    .regex(
      /^[a-z0-9-_]+$/,
      "Only lowercase letters, numbers, hyphens, and underscores",
    )
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .trim()
    .max(64, "Password is too long")
    .optional()
    .or(z.literal("")),
  expiresAt: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Please enter a valid date",
    ),
  maxClicks: z.coerce.number().int().positive().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  tags: z.string().trim().max(200).optional().or(z.literal("")),
});

export const updateLinkSchema = z.object({
  title: z.string().trim().max(120).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  password: z
    .string()
    .trim()
    .max(64)
    .optional()
    .or(z.literal("")),
  clearPassword: z.boolean().optional(),
  expiresAt: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Please enter a valid date",
    ),
  clearExpiry: z.boolean().optional(),
  maxClicks: z.coerce.number().int().positive().optional().or(z.literal("")),
  clearMaxClicks: z.boolean().optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  tags: z.string().trim().max(200).optional().or(z.literal("")),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
