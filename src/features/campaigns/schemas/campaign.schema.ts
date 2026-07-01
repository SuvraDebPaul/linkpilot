import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(280).optional().or(z.literal("")),
});

export const updateCampaignSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(280).optional().or(z.literal("")),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
