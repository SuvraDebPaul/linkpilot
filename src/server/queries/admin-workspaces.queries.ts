import { prisma } from "@/server/db/prisma";

const PAGE_SIZE = 50;

export async function getWorkspacesList(search?: string, page = 1) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [workspaces, total] = await Promise.all([
    prisma.workspace.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        suspended: true,
        createdAt: true,
        _count: { select: { members: true, links: true, campaigns: true } },
        members: {
          where: { role: "OWNER" },
          take: 1,
          select: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.workspace.count({ where }),
  ]);

  return { workspaces, total, pageSize: PAGE_SIZE };
}

export async function getWorkspaceDetail(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      slug: true,
      suspended: true,
      suspendedAt: true,
      createdAt: true,
      _count: { select: { links: true, campaigns: true, customDomains: true } },
      members: {
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  return workspace;
}
