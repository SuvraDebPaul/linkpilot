import { z } from "zod";

export const geoTargetSchema = z.object({
  country: z.string().trim().min(2).max(2),
  url: z.url("Must be a valid URL"),
});

export const createGeoTemplateSchema = z.object({
  workspaceId: z.string(),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  targets: z.array(geoTargetSchema).min(1, "Add at least one country"),
});

export const createCampaignTemplateSchema = z.object({
  workspaceId: z.string(),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  source: z.string().trim().max(120).optional().or(z.literal("")),
  medium: z.string().trim().max(120).optional().or(z.literal("")),
  campaign: z.string().trim().max(120).optional().or(z.literal("")),
  term: z.string().trim().max(120).optional().or(z.literal("")),
  content: z.string().trim().max(120).optional().or(z.literal("")),
});

export type CreateGeoTemplateInput = z.infer<typeof createGeoTemplateSchema>;
export type CreateCampaignTemplateInput = z.infer<typeof createCampaignTemplateSchema>;
