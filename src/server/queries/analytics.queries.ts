import { prisma } from "@/server/db/prisma";
import type { PlanTier } from "@/lib/subscription";

export async function getAnalytics(workspaceId: string, days: number = 30, plan: PlanTier = "free") {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const isStarter = plan === "starter" || plan === "pro";
  const isPro = plan === "pro";

  const uniqueClicksResult = await prisma.linkClickEvent.findMany({
    where: { link: { workspaceId }, createdAt: { gte: since }, ipHash: { not: null } },
    select: { ipHash: true },
    distinct: ["ipHash"],
  });
  const uniqueClicks = uniqueClicksResult.length;

  const [clicksByDay, clicksByDevice] = await Promise.all([
    prisma.linkClickEvent.groupBy({
      by: ["createdAt"],
      where: { link: { workspaceId }, createdAt: { gte: since } },
      _count: { id: true },
    }),
    prisma.linkClickEvent.groupBy({
      by: ["device"],
      where: { link: { workspaceId }, createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  const [clicksByBrowser, topReferrers, topCountries, topLinks] = await Promise.all([
    isStarter
      ? prisma.linkClickEvent.groupBy({
          by: ["browser"],
          where: { link: { workspaceId }, createdAt: { gte: since }, browser: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 8,
        })
      : Promise.resolve([] as Array<{ browser: string | null; _count: { id: number } }>),

    isStarter
      ? prisma.linkClickEvent.groupBy({
          by: ["referrer"],
          where: { link: { workspaceId }, createdAt: { gte: since } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        })
      : Promise.resolve([] as Array<{ referrer: string | null; _count: { id: number } }>),

    isPro
      ? prisma.linkClickEvent.groupBy({
          by: ["country"],
          where: { link: { workspaceId }, createdAt: { gte: since }, country: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        })
      : Promise.resolve([] as Array<{ country: string | null; _count: { id: number } }>),

    isStarter
      ? prisma.link.findMany({
          where: { workspaceId },
          orderBy: { clicks: { _count: "desc" } },
          take: 10,
          select: {
            id: true,
            title: true,
            shortCode: true,
            _count: { select: { clicks: { where: { createdAt: { gte: since } } } } },
          },
        })
      : Promise.resolve(
          [] as Array<{
            id: string;
            title: string | null;
            shortCode: string;
            _count: { clicks: number };
          }>
        ),
  ]);

  // Build day buckets
  const dayMap: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of clicksByDay) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    if (key in dayMap) dayMap[key] += row._count.id;
  }

  const totalClicks = Object.values(dayMap).reduce((a, b) => a + b, 0);

  return {
    totalClicks,
    uniqueClicks,
    clicksPerDay: Object.entries(dayMap).map(([date, count]) => ({ date, count })),
    clicksByDevice: clicksByDevice.map((r) => ({ device: r.device, count: r._count.id })),
    clicksByBrowser: clicksByBrowser.map((r) => ({ browser: r.browser ?? "Other", count: r._count.id })),
    topReferrers: topReferrers.map((r) => ({ referrer: r.referrer ?? "Direct", count: r._count.id })),
    topCountries: topCountries.map((r) => ({ country: r.country ?? "Unknown", count: r._count.id })),
    topLinks: topLinks
      .filter((l) => l._count.clicks > 0)
      .map((l) => ({ id: l.id, label: l.title || l.shortCode, shortCode: l.shortCode, count: l._count.clicks })),
  };
}
