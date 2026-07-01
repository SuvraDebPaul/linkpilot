import type { DeviceType } from "@/generated/prisma/enums";

export function detectBrowser(ua: string | null): string | null {
  if (!ua) return null;
  const u = ua.toLowerCase();
  if (u.includes("edg/") || u.includes("edge/")) return "Edge";
  if (u.includes("opr/") || u.includes("opera/")) return "Opera";
  if (u.includes("chrome/") && !u.includes("chromium")) return "Chrome";
  if (u.includes("chromium/")) return "Chromium";
  if (u.includes("firefox/")) return "Firefox";
  if (u.includes("safari/") && !u.includes("chrome")) return "Safari";
  if (u.includes("msie") || u.includes("trident/")) return "IE";
  return "Other";
}

export function detectOS(ua: string | null): string | null {
  if (!ua) return null;
  const u = ua.toLowerCase();
  if (u.includes("windows nt")) return "Windows";
  if (u.includes("mac os x") || u.includes("macos")) return "macOS";
  if (u.includes("iphone os") || u.includes("ios")) return "iOS";
  if (u.includes("android")) return "Android";
  if (u.includes("linux")) return "Linux";
  if (u.includes("cros")) return "ChromeOS";
  return "Other";
}

export function detectDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "UNKNOWN";

  const value = userAgent.toLowerCase();

  if (
    value.includes("bot") ||
    value.includes("crawler") ||
    value.includes("spider")
  ) {
    return "BOT";
  }

  if (value.includes("tablet") || value.includes("ipad")) {
    return "TABLET";
  }

  if (
    value.includes("mobile") ||
    value.includes("iphone") ||
    value.includes("android")
  ) {
    return "MOBILE";
  }

  return "DESKTOP";
}
