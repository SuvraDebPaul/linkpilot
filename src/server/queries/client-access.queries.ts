import { prisma } from "@/server/db/prisma";

const clientAccessSelect = {
  id: true,
  token: true,
  clientName: true,
  clientEmail: true,
  createdAt: true,
  campaigns: {
    select: {
      campaign: {
        select: { id: true, name: true, shareToken: true },
      },
    },
  },
} as const;

export async function getClientAccessListForWorkspace(workspaceId: string) {
  return prisma.clientAccess.findMany({
    where: { workspaceId },
    select: clientAccessSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientAccessByToken(token: string) {
  return prisma.clientAccess.findUnique({
    where: { token },
    select: {
      id: true,
      clientName: true,
      clientEmail: true,
      workspace: {
        select: {
          id: true,
          name: true,
          brandLogoUrl: true,
          brandColor: true,
          hideBranding: true,
        },
      },
      campaigns: {
        select: {
          campaign: {
            select: {
              id: true,
              name: true,
              description: true,
              shareToken: true,
              links: {
                select: {
                  id: true,
                  isActive: true,
                  expiresAt: true,
                  _count: { select: { clicks: true } },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function countClientAccessForWorkspace(workspaceId: string) {
  return prisma.clientAccess.count({ where: { workspaceId } });
}
