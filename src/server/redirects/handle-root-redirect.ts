import { NextResponse } from "next/server";
import { buildPixelPage, buildOgMeta } from "@/server/services/pixel-page";

import { markGuestLinkExpired } from "@/server/services/cleanup.service";
import { hasUnlockAccess } from "@/server/redirects/handle-password-redirect";
import { recordClick } from "@/server/redirects/record-click";
import { resolveSlug } from "@/server/redirects/resolve-slug";

export async function handleRootRedirect(req: Request, slug: string) {
  const resolved = await resolveSlug(slug);

  if (!resolved) {
    return NextResponse.redirect(new URL("/link-unavailable", req.url));
  }

  // Max-click limit (managed links only)
  if (
    resolved.type === "managed" &&
    resolved.maxClicks !== null &&
    resolved.maxClicks !== undefined &&
    resolved.clickCount >= resolved.maxClicks
  ) {
    return NextResponse.redirect(new URL("/link-unavailable", req.url));
  }

  if (resolved.expiresAt !== null && resolved.expiresAt < new Date()) {
    if (resolved.type === "guest") {
      await markGuestLinkExpired(resolved.id);
    }

    return NextResponse.redirect(new URL("/link-expired", req.url));
  }

  if (!resolved.isActive) {
    return NextResponse.redirect(new URL("/link-unavailable", req.url));
  }

  if (resolved.isPasswordProtected) {
    const unlocked = await hasUnlockAccess(slug);

    if (!unlocked) {
      return NextResponse.redirect(new URL(`/unlock/${slug}`, req.url));
    }
  }

  await recordClick(req, resolved);

  // Geo targeting — CF-IPCountry header, zero latency
  let destination = resolved.originalUrl;
  if (resolved.type === "managed" && resolved.geoTargets?.length) {
    const country = req.headers.get("cf-ipcountry");
    if (country && country !== "XX") {
      const rule = resolved.geoTargets.find((t) => t.country === country);
      if (rule) destination = rule.url;
    }
  }

  // A/B split testing — only when geo didn't override the destination
  if (
    resolved.type === "managed" &&
    resolved.abVariants?.length &&
    destination === resolved.originalUrl
  ) {
    destination = pickWeightedVariant(resolved.abVariants);
  }

  if (resolved.type === "managed") {
    const isCloaked = resolved.isCloaked;
    const hideReferrer = resolved.hideReferrer;
    const ogOpts = { ogTitle: resolved.ogTitle, ogDescription: resolved.ogDescription, ogImage: resolved.ogImage };
    const hasOg = !!(resolved.ogTitle || resolved.ogDescription || resolved.ogImage);

    // Retargeting pixels — build the base HTML then apply cloaking/referrer/OG opts
    if (resolved.retargetingPixels?.length) {
      const html = buildPixelPage(resolved.retargetingPixels, destination, { isCloaked, hideReferrer, ...ogOpts });
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    // Cloaking — keep the short URL in the address bar, show destination in full-screen iframe
    if (isCloaked) {
      const safe = destination.replace(/[<>"]/g, "");
      const ogMeta = buildOgMeta(resolved.ogTitle, resolved.ogDescription, resolved.ogImage);
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="robots" content="noindex">${ogMeta}<style>*{margin:0;padding:0}html,body,iframe{width:100%;height:100%;border:none;overflow:hidden}</style></head><body><iframe src="${safe}" allowfullscreen></iframe></body></html>`;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Frame-Options": "SAMEORIGIN" },
      });
    }

    // Referrer hiding — redirect via an intermediate page with no-referrer policy
    if (hideReferrer) {
      const escapedDest = JSON.stringify(destination);
      const safeDest = destination.replace(/[<>"]/g, "");
      const ogMeta = buildOgMeta(resolved.ogTitle, resolved.ogDescription, resolved.ogImage);
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="referrer" content="no-referrer"><meta name="robots" content="noindex">${ogMeta}</head><body><script>window.location.replace(${escapedDest})</script><noscript><meta http-equiv="refresh" content="0;url=${safeDest}"></noscript></body></html>`;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
      });
    }

    // OG tags only — serve a meta page with immediate JS redirect
    if (hasOg) {
      const escapedDest = JSON.stringify(destination);
      const safeDest = destination.replace(/[<>"]/g, "");
      const ogMeta = buildOgMeta(resolved.ogTitle, resolved.ogDescription, resolved.ogImage);
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="robots" content="noindex">${ogMeta}</head><body><script>window.location.replace(${escapedDest})</script><noscript><meta http-equiv="refresh" content="0;url=${safeDest}"></noscript></body></html>`;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
  }

  const statusCode =
    resolved.type === "managed" && resolved.redirectType === "301" ? 301
    : resolved.type === "managed" && resolved.redirectType === "307" ? 307
    : 302;

  return NextResponse.redirect(destination, { status: statusCode });
}

function pickWeightedVariant(variants: { url: string; weight: number }[]): string {
  const total = variants.reduce((s, v) => s + v.weight, 0);
  let r = Math.random() * total;
  for (const v of variants) {
    r -= v.weight;
    if (r <= 0) return v.url;
  }
  return variants.at(-1)!.url;
}
