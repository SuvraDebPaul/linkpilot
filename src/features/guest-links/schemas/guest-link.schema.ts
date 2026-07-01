import { z } from "zod";

export const createGuestLinkSchema = z.object({
  originalUrl: z.url("Please enter a valid URL"),

  expiryPreset: z.enum(["1h", "6h", "24h", "3d", "7d"], {
    message: "Please select a valid expiry time",
  }),

  password: z
    .string()
    .trim()
    .max(64, "Password is too long")
    .optional()
    .or(z.literal("")),
});

export type CreateGuestLinkInput = z.infer<typeof createGuestLinkSchema>;
