import { prisma } from "@/server/db/prisma";

// Re-export client-safe constants so server imports don't need to change
export type { PlanTier } from "@/lib/plans";
export { FREE_LIMITS, PLAN_LIMITS, canCreateLink, canCreateCampaign } from "@/lib/plans";

// Single source of truth for "which Stripe price ID is which plan" — every
// place that needs to classify a stripePriceId (admin billing pages, the
// user list's plan column, getUserPlan below) imports these instead of
// re-deriving its own copy, so a future price change only needs updating here.
export const STARTER_PRICE_IDS = [
  process.env.STRIPE_STARTER_PRICE_ID,
  process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
].filter((id): id is string => Boolean(id));

export const PRO_PRICE_IDS = [
  process.env.STRIPE_PRO_PRICE_ID,
  process.env.STRIPE_PRO_YEARLY_PRICE_ID,
].filter((id): id is string => Boolean(id));

// Classifies a still-current (non-expired) subscription's price id. Callers
// that also need to consider lifetimeAccess/isSuperAdmin/expiry do that
// themselves first — this only knows about the price id itself.
export function classifyPriceId(priceId: string | null | undefined): "starter" | "pro" | null {
  if (!priceId) return null;
  if (PRO_PRICE_IDS.includes(priceId)) return "pro";
  if (STARTER_PRICE_IDS.includes(priceId)) return "starter";
  return null;
}

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
      isSuperAdmin: true,
    },
  });

  if (!user) return "free";
  // The platform owner shouldn't be limited by their own product's plan
  // gates while using their own regular dashboard.
  if (user.isSuperAdmin) return "pro";
  if (user.lifetimeAccess) return "pro";

  if (!user.stripePriceId || !user.stripeCurrentPeriodEnd) return "free";
  if (user.stripeCurrentPeriodEnd <= new Date()) return "free";

  return classifyPriceId(user.stripePriceId) ?? "free";
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
