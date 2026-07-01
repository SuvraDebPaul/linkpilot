import { prisma } from "@/server/db/prisma";

export async function getCampaignsByWorkspace(workspaceId: string) {
  return prisma.campaign.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { links: true } },
    },
  });
}

const campaignDetailSelect = {
  id: true,
  name: true,
  description: true,
  shareToken: true,
  reportEmailEnabled: true,
  reportEmailFrequency: true,
  reportEmailRecipients: true,
  reportEmailLastSentAt: true,
  createdAt: true,
  links: {
    orderBy: { createdAt: "desc" } as const,
    select: {
      id: true,
      title: true,
      shortCode: true,
      originalUrl: true,
      isActive: true,
      expiresAt: true,
      createdAt: true,
      _count: { select: { clicks: true } },
    },
  },
} as const;

export async function getCampaignById(id: string, userId: string) {
  return prisma.campaign.findFirst({
    where: { id, workspace: { members: { some: { userId } } } },
    select: campaignDetailSelect,
  });
}

export async function getCampaignByShareToken(token: string) {
  if (!token) return null;
  return prisma.campaign.findUnique({
    where: { shareToken: token },
    select: campaignDetailSelect,
  });
}

export async function getCampaignReportData(
  token: string,
  from?: Date | null,
  to?: Date | null,
) {
  if (!token) return null;
  return prisma.campaign.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      name: true,
      description: true,
      shareToken: true,
      createdAt: true,
      workspace: {
        select: {
          brandLogoUrl: true,
          brandColor: true,
          hideBranding: true,
        },
      },
      links: {
        orderBy: { createdAt: "desc" as const },
        select: {
          id: true,
          title: true,
          shortCode: true,
          isActive: true,
          expiresAt: true,
          _count: {
            select: {
              clicks: {
                where: {
                  createdAt: {
                    ...(from ? { gte: from } : {}),
                    ...(to ? { lte: to } : {}),
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getCampaignDeviceBreakdown(
  linkIds: string[],
  from?: Date | null,
  to?: Date | null,
) {
  if (linkIds.length === 0) return [];
  return prisma.linkClickEvent.groupBy({
    by: ["device"],
    where: {
      linkId: { in: linkIds },
      createdAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });
}

export async function getCampaignsForReportEmail() {
  return prisma.campaign.findMany({
    where: { reportEmailEnabled: true, shareToken: { not: null } },
    select: {
      id: true,
      name: true,
      shareToken: true,
      reportEmailFrequency: true,
      reportEmailRecipients: true,
      reportEmailLastSentAt: true,
      workspace: {
        select: { brandLogoUrl: true, brandColor: true, hideBranding: true },
      },
      links: {
        select: { id: true, title: true, shortCode: true, _count: { select: { clicks: true } } },
      },
    },
  });
}

export async function getWorkspaceCampaignsForSelect(workspaceId: string) {
  return prisma.campaign.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
