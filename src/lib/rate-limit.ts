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

const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS_PER_EMAIL = 5;
const MAX_LOGIN_ATTEMPTS_PER_IP = 20;

/** Blocks credentials-login brute force: max 5 failed attempts per email, 20 per IP, per 15 minutes. */
export async function checkLoginRateLimit(identifier: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MS);

  const [emailCount, ipCount] = await Promise.all([
    prisma.loginAttempt.count({ where: { identifier, createdAt: { gte: since } } }),
    ip !== "Unknown"
      ? prisma.loginAttempt.count({ where: { ip, createdAt: { gte: since } } })
      : Promise.resolve(0),
  ]);

  return emailCount < MAX_LOGIN_ATTEMPTS_PER_EMAIL && ipCount < MAX_LOGIN_ATTEMPTS_PER_IP;
}

/** Records a failed login attempt for rate-limiting purposes. */
export async function recordFailedLoginAttempt(identifier: string, ip: string): Promise<void> {
  await prisma.loginAttempt.create({ data: { identifier, ip } });
}

const UNLOCK_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_UNLOCK_ATTEMPTS = 10;

/** Blocks password-protected-link brute force: max 10 failed unlock attempts per link per IP per 15 minutes. */
export async function checkUnlockRateLimit(slug: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - UNLOCK_ATTEMPT_WINDOW_MS);
  const count = await prisma.unlockAttempt.count({
    where: { slug, ip, createdAt: { gte: since } },
  });
  return count < MAX_UNLOCK_ATTEMPTS;
}

/** Records a failed unlock attempt for rate-limiting purposes. */
export async function recordFailedUnlockAttempt(slug: string, ip: string): Promise<void> {
  await prisma.unlockAttempt.create({ data: { slug, ip } });
}

const IMPORT_WINDOW_MS = 60 * 60 * 1000;
const MAX_IMPORTS_PER_HOUR = 3;

/** CSV import: max 3 import calls per user per hour (bulk operation, not meant to be repeated rapidly). */
export async function checkImportRateLimit(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - IMPORT_WINDOW_MS);
  const count = await prisma.importAttempt.count({ where: { userId, createdAt: { gte: since } } });
  return count < MAX_IMPORTS_PER_HOUR;
}

/** Records a CSV import call for rate-limiting purposes. */
export async function recordImportAttempt(userId: string): Promise<void> {
  await prisma.importAttempt.create({ data: { userId } });
}
