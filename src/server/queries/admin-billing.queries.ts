import { prisma } from "@/server/db/prisma";
import { STARTER_PRICE_IDS, PRO_PRICE_IDS } from "@/lib/subscription";

export async function getBillingOverview() {
  const now = new Date();

  const [starterUsers, proUsers, lifetimeCount] = await Promise.all([
    prisma.user.count({
      where: { stripePriceId: { in: STARTER_PRICE_IDS }, stripeCurrentPeriodEnd: { gt: now } },
    }),
    prisma.user.count({
      where: { stripePriceId: { in: PRO_PRICE_IDS }, stripeCurrentPeriodEnd: { gt: now } },
    }),
    prisma.user.count({ where: { lifetimeAccess: true } }),
  ]);

  return {
    starterUsers,
    proUsers,
    lifetimeCount,
    mrrEstimate: starterUsers * 5 + proUsers * 10,
  };
}

export async function getPayingUsers(search?: string) {
  const now = new Date();
  return prisma.user.findMany({
    where: {
      OR: [
        { lifetimeAccess: true },
        { AND: [{ stripePriceId: { not: null } }, { stripeCurrentPeriodEnd: { gt: now } }] },
      ],
      ...(search
        ? { email: { contains: search, mode: "insensitive" as const } }
        : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      lifetimeAccess: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      stripeSubscriptionId: true,
    },
    orderBy: { email: "asc" },
    take: 100,
  });
}
