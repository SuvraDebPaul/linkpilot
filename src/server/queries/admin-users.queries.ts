import { prisma } from "@/server/db/prisma";

const PAGE_SIZE = 50;

export async function getUsersList(search?: string, page = 1) {
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isSuperAdmin: true,
        suspended: true,
        lifetimeAccess: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
        _count: { select: { workspaces: true, links: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, pageSize: PAGE_SIZE };
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      isSuperAdmin: true,
      suspended: true,
      suspendedAt: true,
      lifetimeAccess: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      totalLinksCreated: true,
      totalCampaignsCreated: true,
      createdAt: true,
      sessionVersion: true,
      workspaces: {
        select: {
          role: true,
          workspace: { select: { id: true, name: true, slug: true } },
        },
      },
      loginEvents: {
        select: { id: true, type: true, ip: true, browser: true, createdAt: true, revoked: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return user;
}
