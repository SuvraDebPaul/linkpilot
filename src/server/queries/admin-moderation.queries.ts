import { prisma } from "@/server/db/prisma";

export async function getBlockedDomains() {
  return prisma.blockedDomain.findMany({ orderBy: { createdAt: "desc" } });
}

const PAGE_SIZE = 50;

export async function getLinksList(search?: string, page = 1) {
  const where = search
    ? {
        OR: [
          { shortCode: { contains: search, mode: "insensitive" as const } },
          { originalUrl: { contains: search, mode: "insensitive" as const } },
          { workspace: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where,
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        isActive: true,
        createdAt: true,
        workspace: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.link.count({ where }),
  ]);

  return { links, total, pageSize: PAGE_SIZE };
}
