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

export async function recordClick(
  req: Request,
  resolved: NonNullable<ResolvedSlug>,
) {
  const userAgent = req.headers.get("user-agent");
  const device = detectDeviceType(userAgent);

  if (device === "BOT") return;

  const referrer = req.headers.get("referer");
  const ip = getClientIp(req);
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  const { country, city } = await detectGeo(req, ip);

  const reqUrl = new URL(req.url);
  const utmSource   = reqUrl.searchParams.get("utm_source")   || null;
  const utmMedium   = reqUrl.searchParams.get("utm_medium")   || null;
  const utmCampaign = reqUrl.searchParams.get("utm_campaign") || null;
  const utmTerm     = reqUrl.searchParams.get("utm_term")     || null;
  const utmContent  = reqUrl.searchParams.get("utm_content")  || null;

  if (resolved.type === "guest") {
    await prisma.guestClickEvent.create({
      data: {
        guestLinkId: resolved.id,
        ipHash: ip ? hashValue(ip) : null,
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
    await prisma.linkClickEvent.create({
      data: {
        linkId: resolved.id,
        ipHash: ip ? hashValue(ip) : null,
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
