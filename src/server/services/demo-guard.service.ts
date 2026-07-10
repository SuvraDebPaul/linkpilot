import { prisma } from "@/server/db/prisma";

/**
 * The public demo account (and its seeded teammates) uses shared, publicly
 * documented credentials. Without this guard, anyone could sign in and use
 * LinkPilot's own redirect infrastructure to point short links at arbitrary
 * destinations — turning it into an open redirector for phishing/abuse.
 * So every destination a demo account tries to set is forced to a fixed,
 * safe URL instead of trusting the input, while everything else about link
 * creation (titles, tags, campaigns, QR styling, etc.) still works normally.
 */
export const DEMO_SAFE_URL = "https://linkpilot.com";

export async function isDemoAccount(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isDemoAccount: true },
  });
  return user?.isDemoAccount ?? false;
}

/** Returns `url` unchanged, unless the user is a demo account — then always returns the safe fixed URL. */
export async function enforceDemoRedirect(userId: string, url: string): Promise<string> {
  return (await isDemoAccount(userId)) ? DEMO_SAFE_URL : url;
}
