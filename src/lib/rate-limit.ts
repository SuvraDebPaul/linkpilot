import { prisma } from "@/server/db/prisma";

/** Guest links: max 5 per IP hash per hour */
export async function checkGuestLinkRateLimit(ipHash: string | null): Promise<boolean> {
  if (!ipHash) return true; // no IP = can't rate limit, allow through

  const since = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
  const count = await prisma.guestLink.count({
    where: { creatorIpHash: ipHash, createdAt: { gte: since } },
  });

  return count < 5;
}

/** Authenticated links: max 20 per user per minute */
export async function checkAuthLinkRateLimit(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 1000);
  const count = await prisma.link.count({
    where: { userId, createdAt: { gte: since } },
  });
  return count < 20;
}

/** Campaigns: max 10 per user per hour */
export async function checkCampaignRateLimit(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.campaign.count({
    where: { userId, createdAt: { gte: since } },
  });
  return count < 10;
}
