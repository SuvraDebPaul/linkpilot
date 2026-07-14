import { prisma } from "@/server/db/prisma";

export async function getLinkAnalytics(linkId: string, userId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Verify ownership
  const link = await prisma.link.findFirst({
    where: { id: linkId, workspace: { members: { some: { userId } } } },
    select: { id: true },
  });
  if (!link) return null;

  const where = { linkId, createdAt: { gte: since } };

  const [clicksByDay, clicksByDevice, clicksByBrowser, topReferrers, topCountries,
    utmSources, utmMediums, utmCampaigns] =
    await Promise.all([
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
        FROM "LinkClickEvent"
        WHERE "linkId" = ${linkId}
          AND "createdAt" >= ${since}
        GROUP BY day
      `,
      prisma.linkClickEvent.groupBy({
        by: ["device"],
        where,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.linkClickEvent.groupBy({
        by: ["browser"],
        where: { ...where, browser: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 6,
      }),
      prisma.linkClickEvent.groupBy({
        by: ["referrer"],
        where,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      }),
      prisma.linkClickEvent.groupBy({
        by: ["country"],
        where: { ...where, country: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      }),
      prisma.linkClickEvent.groupBy({
        by: ["utmSource"],
        where: { ...where, utmSource: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.linkClickEvent.groupBy({
        by: ["utmMedium"],
        where: { ...where, utmMedium: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.linkClickEvent.groupBy({
        by: ["utmCampaign"],
        where: { ...where, utmCampaign: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

  // Fill day buckets
  const dayMap: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of clicksByDay) {
    const key = new Date(row.day).toISOString().slice(0, 10);
    if (key in dayMap) dayMap[key] += Number(row.count);
  }

  return {
    clicksPerDay:    Object.entries(dayMap).map(([date, count]) => ({ date, count })),
    clicksByDevice:  clicksByDevice.map((r) => ({ device: r.device, count: r._count.id })),
    clicksByBrowser: clicksByBrowser.map((r) => ({ browser: r.browser ?? "Other", count: r._count.id })),
    topReferrers:    topReferrers.map((r) => ({ referrer: r.referrer ?? "Direct", count: r._count.id })),
    topCountries:    topCountries.map((r) => ({ country: r.country ?? "Unknown", count: r._count.id })),
    utmSources:      utmSources.map((r) => ({ label: r.utmSource!, count: r._count.id })),
    utmMediums:      utmMediums.map((r) => ({ label: r.utmMedium!, count: r._count.id })),
    utmCampaigns:    utmCampaigns.map((r) => ({ label: r.utmCampaign!, count: r._count.id })),
  };
}
