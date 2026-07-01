import { prisma } from "@/server/db/prisma";

// Re-export client-safe constants so server imports don't need to change
export type { PlanTier } from "@/lib/plans";
export { FREE_LIMITS, PLAN_LIMITS, canCreateLink, canCreateCampaign } from "@/lib/plans";

export interface PlanUser {
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  lifetimeAccess: boolean;
  totalLinksCreated: number;
  totalCampaignsCreated: number;
}

export async function getUserPlan(userId: string): Promise<import("@/lib/plans").PlanTier> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      lifetimeAccess: true,
    },
  });

  if (!user) return "free";
  if (user.lifetimeAccess) return "pro";

  if (!user.stripePriceId || !user.stripeCurrentPeriodEnd) return "free";
  if (user.stripeCurrentPeriodEnd <= new Date()) return "free";

  const starterIds = [
    process.env.STRIPE_STARTER_PRICE_ID,
    process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
  ];
  const proIds = [
    process.env.STRIPE_PRO_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  ];

  if (proIds.includes(user.stripePriceId)) return "pro";
  if (starterIds.includes(user.stripePriceId)) return "starter";

  return "free";
}

export async function getUserUsage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalLinksCreated: true,
      totalCampaignsCreated: true,
      lifetimeAccess: true,
    },
  });
  return {
    linksCreated: user?.totalLinksCreated ?? 0,
    campaignsCreated: user?.totalCampaignsCreated ?? 0,
    isLifetime: user?.lifetimeAccess ?? false,
  };
}
