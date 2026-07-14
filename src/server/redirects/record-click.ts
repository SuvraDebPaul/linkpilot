import type { ResolvedSlug } from "@/server/redirects/resolve-slug";
import { prisma } from "@/server/db/prisma";
import { hashValue } from "@/lib/crypto";
import { detectDeviceType, detectBrowser, detectOS } from "@/lib/user-agent";
import { detectGeo } from "@/lib/geo";

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || null
  );
}

// Same IP hitting the same link repeatedly within this window records only once —
// stops click-fraud/flood scripts from inflating counts or spamming the click-event
// tables, without ever blocking the redirect itself (real visitors always proceed).
const CLICK_DEDUPE_WINDOW_MS = 10 * 1000;

export async function recordClick(
  req: Request,
  resolved: NonNullable<ResolvedSlug>,
) {
  const userAgent = req.headers.get("user-agent");
  const device = detectDeviceType(userAgent);

  if (device === "BOT") return;

  const referrer = req.headers.get("referer");
  const ip = getClientIp(req);
  const ipHash = ip ? hashValue(ip) : null;
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  const { country, city } = await detectGeo(req, ip);

  const reqUrl = new URL(req.url);
  const utmSource   = reqUrl.searchParams.get("utm_source")   || null;
  const utmMedium   = reqUrl.searchParams.get("utm_medium")   || null;
  const utmCampaign = reqUrl.searchParams.get("utm_campaign") || null;
  const utmTerm     = reqUrl.searchParams.get("utm_term")     || null;
  const utmContent  = reqUrl.searchParams.get("utm_content")  || null;

  const since = new Date(Date.now() - CLICK_DEDUPE_WINDOW_MS);

  if (resolved.type === "guest") {
    if (ipHash) {
      const recent = await prisma.guestClickEvent.findFirst({
        where: { guestLinkId: resolved.id, ipHash, createdAt: { gte: since } },
        select: { id: true },
      });
      if (recent) return;
    }

    await prisma.guestClickEvent.create({
      data: {
        guestLinkId: resolved.id,
        ipHash,
        device,
        browser,
        os,
        referrer,
        userAgent,
        country,
        city,
      },
    });
  } else if (resolved.type === "managed") {
    if (ipHash) {
      const recent = await prisma.linkClickEvent.findFirst({
        where: { linkId: resolved.id, ipHash, createdAt: { gte: since } },
        select: { id: true },
      });
      if (recent) return;
    }

    await prisma.linkClickEvent.create({
      data: {
        linkId: resolved.id,
        ipHash,
        device,
        browser,
        os,
        referrer,
        userAgent,
        country,
        city,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      },
    });
  }
}
