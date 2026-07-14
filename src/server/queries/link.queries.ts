import { prisma } from "@/server/db/prisma";

export async function getLinkBySlug(shortCode: string) {
  return prisma.link.findUnique({
    where: { shortCode },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      passwordHash: true,
      isPasswordProtected: true,
      expiresAt: true,
      maxClicks: true,
      isActive: true,
      geoTargets: true,
      abVariants: true,
      retargetingPixels: true,
      isCloaked: true,
      hideReferrer: true,
      redirectType: true,
      ogTitle: true,
      ogDescription: true,
      ogImage: true,
      customDomain: { select: { domain: true } },
      _count: { select: { clicks: true } },
    },
  });
}

export async function getLinksByWorkspace(workspaceId: string) {
  return prisma.link.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      shortCode: true,
      originalUrl: true,
      isActive: true,
      isPasswordProtected: true,
      isFavorite: true,
      expiresAt: true,
      createdAt: true,
      tags: true,
      customDomain: { select: { domain: true } },
      campaign: { select: { id: true, name: true } },
      _count: { select: { clicks: true } },
    },
  });
}


export async function getLinkById(id: string, userId: string) {
  return prisma.link.findFirst({
    where: {
      id,
      workspace: { members: { some: { userId } } },
    },
    include: {
      customDomain: { select: { domain: true } },
      _count: { select: { clicks: true } },
      // QR fields are included via the model defaults — no need to list explicitly
      clicks: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          device: true,
          browser: true,
          os: true,
          referrer: true,
          country: true,
          createdAt: true,
        },
      },
    },
  });
}
