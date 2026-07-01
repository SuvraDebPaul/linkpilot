import { getGuestLinkBySlug } from "@/server/queries/guest-link.queries";
import { getLinkBySlug } from "@/server/queries/link.queries";

export async function resolveSlug(slug: string) {
  // Check managed links first (they take priority)
  const managedLink = await getLinkBySlug(slug);
  if (managedLink) {
    return {
      type: "managed" as const,
      id: managedLink.id,
      originalUrl: managedLink.originalUrl,
      shortCode: managedLink.shortCode,
      passwordHash: managedLink.passwordHash,
      isPasswordProtected: managedLink.isPasswordProtected,
      expiresAt: managedLink.expiresAt,
      maxClicks: managedLink.maxClicks,
      clickCount: managedLink._count.clicks,
      isActive: managedLink.isActive,
      geoTargets: managedLink.geoTargets as { country: string; url: string }[] | null,
      abVariants: managedLink.abVariants as { url: string; weight: number }[] | null,
      retargetingPixels: managedLink.retargetingPixels as { type: "meta" | "google" | "tiktok" | "linkedin"; id: string }[] | null,
      isCloaked: managedLink.isCloaked,
      hideReferrer: managedLink.hideReferrer,
      redirectType: managedLink.redirectType,
      ogTitle: managedLink.ogTitle,
      ogDescription: managedLink.ogDescription,
      ogImage: managedLink.ogImage,
    };
  }

  const guestLink = await getGuestLinkBySlug(slug);
  if (guestLink) {
    return {
      type: "guest" as const,
      id: guestLink.id,
      originalUrl: guestLink.originalUrl,
      shortCode: guestLink.shortCode,
      passwordHash: guestLink.passwordHash,
      isPasswordProtected: guestLink.isPasswordProtected,
      expiresAt: guestLink.expiresAt,
      isActive: guestLink.isActive,
    };
  }

  return null;
}

export type ResolvedSlug = Awaited<ReturnType<typeof resolveSlug>>;
