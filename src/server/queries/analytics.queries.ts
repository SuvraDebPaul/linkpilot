import { prisma } from "@/server/db/prisma";
import type { PlanTier } from "@/lib/subscription";

export async function getBusinessOverview(workspaceId: string, days: number = 30) {
  const now = new Date();
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalLinks,
    totalCampaigns,
    totalClients,
    totalClicksAllTime,
    clicksThisPeriod,
    clicksPrevPeriod,
    campaignsWithClicks,
    activeLinks,
    inactiveLinks,
    expiredLinks,
    expiringSoon,
  ] = await Promise.all([
    prisma.link.count({ where: { workspaceId } }),
    prisma.campaign.count({ where: { workspaceId } }),
    prisma.clientAccess.count({ where: { workspaceId } }),
    prisma.linkClickEvent.count({ where: { link: { workspaceId } } }),
    prisma.linkClickEvent.count({ where: { link: { workspaceId }, createdAt: { gte: since } } }),
    prisma.linkClickEvent.count({ where: { link: { workspaceId }, createdAt: { gte: prevSince, lt: since } } }),
    prisma.campaign.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        links: { select: { _count: { select: { clicks: { where: { createdAt: { gte: since } } } } } } },
      },
    }),
    prisma.link.count({
      where: { workspaceId, isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    }),
    prisma.link.count({
      where: { workspaceId, isActive: false, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    }),
    prisma.link.count({ where: { workspaceId, expiresAt: { lte: now } } }),
    prisma.link.count({
      where: { workspaceId, isActive: true, expiresAt: { gt: now, lte: sevenDaysFromNow } },
    }),
  ]);

  const growthPct =
    clicksPrevPeriod > 0
      ? Math.round(((clicksThisPeriod - clicksPrevPeriod) / clicksPrevPeriod) * 100)
      : clicksThisPeriod > 0
        ? 100
        : 0;

  const topCampaigns = campaignsWithClicks
    .map((c) => ({
      id: c.id,
      name: c.name,
      count: c.links.reduce((s, l) => s + l._count.clicks, 0),
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalLinks,
    totalCampaigns,
    totalClients,
    totalClicksAllTime,
    clicksThisPeriod,
    clicksPrevPeriod,
    growthPct,
    topCampaigns,
    activeLinks,
    inactiveLinks,
    expiredLinks,
    expiringSoon,
  };
}

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

  const [clicksByBrowser, clicksByOs, topReferrers, topCountries, topLinks] = await Promise.all([
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
          by: ["os"],
          where: { link: { workspaceId }, createdAt: { gte: since }, os: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 6,
        })
      : Promise.resolve([] as Array<{ os: string | null; _count: { id: number } }>),

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
    clicksByOs: clicksByOs.map((r) => ({ os: r.os ?? "Other", count: r._count.id })),
    topReferrers: topReferrers.map((r) => ({ referrer: r.referrer ?? "Direct", count: r._count.id })),
    topCountries: topCountries.map((r) => ({ country: r.country ?? "Unknown", count: r._count.id })),
    topLinks: topLinks
      .filter((l) => l._count.clicks > 0)
      .map((l) => ({ id: l.id, label: l.title || l.shortCode, shortCode: l.shortCode, count: l._count.clicks })),
  };
}
