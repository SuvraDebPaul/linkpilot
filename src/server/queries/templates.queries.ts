import { prisma } from "@/server/db/prisma";

export async function getGeoTemplates(workspaceId: string) {
  return prisma.geoTemplate.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignTemplates(workspaceId: string) {
  return prisma.campaignTemplate.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}
