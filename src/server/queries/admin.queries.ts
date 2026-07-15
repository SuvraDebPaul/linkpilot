import { prisma } from "@/server/db/prisma";

const STARTER_PRICE_IDS = [
  process.env.STRIPE_STARTER_PRICE_ID,
  process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
].filter(Boolean);
const PRO_PRICE_IDS = [
  process.env.STRIPE_PRO_PRICE_ID,
  process.env.STRIPE_PRO_YEARLY_PRICE_ID,
].filter(Boolean);

export async function getPlatformStats() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalWorkspaces,
    totalLinks,
    totalClicks,
    newUsers7d,
    newUsers30d,
    suspendedUsers,
    suspendedWorkspaces,
    lifetimeUsers,
    activeSubscribers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.link.count(),
    prisma.linkClickEvent.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.workspace.count({ where: { suspended: true } }),
    prisma.user.count({ where: { lifetimeAccess: true } }),
    prisma.user.findMany({
      where: {
        stripeCurrentPeriodEnd: { gt: now },
        stripePriceId: { in: [...STARTER_PRICE_IDS, ...PRO_PRICE_IDS] as string[] },
      },
      select: { stripePriceId: true },
    }),
  ]);

  const starterCount = activeSubscribers.filter(
    (u) => u.stripePriceId && STARTER_PRICE_IDS.includes(u.stripePriceId),
  ).length;
  const proCount = activeSubscribers.filter(
    (u) => u.stripePriceId && PRO_PRICE_IDS.includes(u.stripePriceId),
  ).length;

  // Rough MRR estimate — yearly plans are annualized down to a monthly figure.
  // Good enough for an at-a-glance dashboard number, not meant to reconcile
  // against Stripe's own revenue reporting.
  const mrrEstimate = starterCount * 5 + proCount * 10;

  return {
    totalUsers,
    totalWorkspaces,
    totalLinks,
    totalClicks,
    newUsers7d,
    newUsers30d,
    suspendedUsers,
    suspendedWorkspaces,
    lifetimeUsers,
    starterSubscribers: starterCount,
    proSubscribers: proCount,
    mrrEstimate,
  };
}
