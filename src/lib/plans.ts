export type PlanTier = "free" | "starter" | "pro";

export const FREE_LIMITS = { links: 50, campaigns: 2 } as const;

export const PLAN_LIMITS: Record<PlanTier, { links: number; campaigns: number; customDomains: number; clientPortals: number; abVariants: number; retargetingPixels: number; customRedirectType: boolean; ogTags: boolean }> = {
  free:    { links: 50,       campaigns: 2,        customDomains: 0,        clientPortals: 0,        abVariants: 0, retargetingPixels: 0, customRedirectType: false, ogTags: false },
  starter: { links: 500,      campaigns: 100,      customDomains: 1,        clientPortals: 3,        abVariants: 2, retargetingPixels: 2, customRedirectType: true,  ogTags: false },
  pro:     { links: Infinity, campaigns: Infinity, customDomains: Infinity, clientPortals: Infinity, abVariants: 5, retargetingPixels: 4, customRedirectType: true,  ogTags: true  },
};

export function canCreateLink(plan: PlanTier, count: number): boolean {
  return count < PLAN_LIMITS[plan].links;
}

export function canCreateCampaign(plan: PlanTier, count: number): boolean {
  return count < PLAN_LIMITS[plan].campaigns;
}

export function canAddDomain(plan: PlanTier, count: number): boolean {
  return count < PLAN_LIMITS[plan].customDomains;
}

export function canAddClientPortal(plan: PlanTier, count: number): boolean {
  return count < PLAN_LIMITS[plan].clientPortals;
}
