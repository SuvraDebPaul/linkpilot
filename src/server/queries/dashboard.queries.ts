import { prisma } from "@/server/db/prisma";

export async function getDashboardStats(userId: string, workspaceId: string) {
  const now = new Date();
  const sevenDaysFromNow   = new Date(now.getTime() + 7  * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo      = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo       = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo    = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const eightyFourDaysAgo  = new Date(now.getTime() - 84 * 24 * 60 * 60 * 1000);

  const [
    totalLinks,
    totalCampaigns,
    activeLinks,
    inactiveLinks,
    expiredLinks,
    expiringSoon,
    totalClicks,
    clicksLast30Days,
    clicksLast7Days,
    clicksPrev7Days,
    linksThisWeek,
    recentLinks,
    clicksByDay84,
    clicksByDevice,
    clicksByBrowser,
    clicksByOs,
    clicksByCountry,
    topLinks,
    topCampaignsRaw,
  ] = await Promise.all([
    prisma.link.count({ where: { workspaceId } }),
    prisma.campaign.count({ where: { workspaceId } }),
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
    prisma.linkClickEvent.count({ where: { link: { workspaceId } } }),
    prisma.linkClickEvent.count({ where: { link: { workspaceId }, createdAt: { gte: thirtyDaysAgo } } }),
    // Last 7 days
    prisma.linkClickEvent.count({ where: { link: { workspaceId }, createdAt: { gte: sevenDaysAgo } } }),
    // Previous 7 days (8–14 days ago) — for trend comparison
    prisma.linkClickEvent.count({
      where: { link: { workspaceId }, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    }),
    prisma.link.count({ where: { workspaceId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.link.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, title: true, shortCode: true, isActive: true,
        expiresAt: true, createdAt: true,
        _count: { select: { clicks: true } },
      },
    }),
    prisma.linkClickEvent.groupBy({
      by: ["createdAt"],
      where: { link: { workspaceId }, createdAt: { gte: eightyFourDaysAgo } },
      _count: { id: true },
    }),
    prisma.linkClickEvent.groupBy({
      by: ["device"],
      where: { link: { workspaceId }, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.linkClickEvent.groupBy({
      by: ["browser"],
      where: { link: { workspaceId }, createdAt: { gte: thirtyDaysAgo }, browser: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
    prisma.linkClickEvent.groupBy({
      by: ["os"],
      where: { link: { workspaceId }, createdAt: { gte: thirtyDaysAgo }, os: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
    prisma.linkClickEvent.groupBy({
      by: ["country"],
      where: { link: { workspaceId }, createdAt: { gte: thirtyDaysAgo }, country: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
    prisma.link.findMany({
      where: { workspaceId },
      orderBy: { clicks: { _count: "desc" } },
      take: 5,
      select: { id: true, title: true, shortCode: true, _count: { select: { clicks: true } } },
    }),
    prisma.campaign.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        _count: { select: { links: true } },
        links: { select: { _count: { select: { clicks: true } } } },
      },
    }),
  ]);

  // 30-day buckets
  const dayMap30: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap30[d.toISOString().slice(0, 10)] = 0;
  }

  // 84-day buckets
  const dayMap84: Record<string, number> = {};
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap84[d.toISOString().slice(0, 10)] = 0;
  }

  for (const row of clicksByDay84) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    if (key in dayMap30) dayMap30[key] += row._count.id;
    if (key in dayMap84) dayMap84[key] += row._count.id;
  }

  // Click trend: % change last 7d vs prev 7d
  const clickTrend = clicksPrev7Days === 0
    ? clicksLast7Days > 0 ? 100 : 0
    : Math.round(((clicksLast7Days - clicksPrev7Days) / clicksPrev7Days) * 100);

  const topCampaigns = topCampaignsRaw
    .map((c) => ({
      id:          c.id,
      name:        c.name,
      linkCount:   c._count.links,
      totalClicks: c.links.reduce((sum, l) => sum + l._count.clicks, 0),
    }))
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 6);

  return {
    totalLinks,
    totalCampaigns,
    activeLinks,
    inactiveLinks,
    expiredLinks,
    expiringSoon,
    totalClicks,
    clicksLast30Days,
    clicksLast7Days,
    clicksPrev7Days,
    clickTrend,
    linksThisWeek,
    recentLinks,
    clicksPerDay:    Object.entries(dayMap30).map(([date, count]) => ({ date, count })),
    clicksPerDay84:  Object.entries(dayMap84).map(([date, count]) => ({ date, count })),
    clicksByDevice:  clicksByDevice.map((r) => ({ device: r.device as string, count: r._count.id })),
    clicksByBrowser: clicksByBrowser.map((r) => ({ name: r.browser ?? "Unknown", count: r._count.id })),
    clicksByOs:      clicksByOs.map((r) => ({ name: r.os ?? "Unknown", count: r._count.id })),
    clicksByCountry: clicksByCountry.map((r) => ({ name: r.country ?? "Unknown", count: r._count.id })),
    topLinks,
    topCampaigns,
  };
}
