import { prisma } from "@/server/db/prisma";

export async function getSignupsPerDay(days = 30) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
    FROM "User"
    WHERE "createdAt" >= ${startDate}
    GROUP BY day
  `;

  const dayMap: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of rows) {
    const key = new Date(row.day).toISOString().slice(0, 10);
    if (key in dayMap) dayMap[key] = Number(row.count);
  }

  return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
}

export async function getTopWorkspacesByUsage(limit = 10) {
  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { links: true, members: true } },
    },
    orderBy: { links: { _count: "desc" } },
    take: limit,
  });

  // Click counts need a separate aggregate since they live on LinkClickEvent,
  // not directly countable via Workspace's own _count relation.
  const clickCounts = await prisma.linkClickEvent.groupBy({
    by: ["linkId"],
    where: { link: { workspaceId: { in: workspaces.map((w) => w.id) } } },
    _count: { id: true },
  });
  const linkToWorkspace = await prisma.link.findMany({
    where: { id: { in: clickCounts.map((c) => c.linkId) } },
    select: { id: true, workspaceId: true },
  });
  const workspaceIdByLinkId = new Map(linkToWorkspace.map((l) => [l.id, l.workspaceId]));
  const clicksByWorkspace = new Map<string, number>();
  for (const row of clickCounts) {
    const workspaceId = workspaceIdByLinkId.get(row.linkId);
    if (!workspaceId) continue;
    clicksByWorkspace.set(workspaceId, (clicksByWorkspace.get(workspaceId) ?? 0) + row._count.id);
  }

  return workspaces
    .map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      links: w._count.links,
      members: w._count.members,
      clicks: clicksByWorkspace.get(w.id) ?? 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);
}
