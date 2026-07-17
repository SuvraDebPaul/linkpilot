"use server";

import { getSiteSetting } from "@/lib/site-settings";

// Public, unauthenticated read — the banner's whole point is that toggling it
// in /admin/config takes effect immediately, including on statically
// generated marketing pages, which a server-rendered fetch alone can't give
// without forcing those pages dynamic. Calling this from the client on mount
// keeps the pages static while the banner content itself stays live.
export async function getAnnouncementBannerAction(): Promise<{ enabled: boolean; message: string }> {
  const raw = await getSiteSetting("announcementBanner", '{"enabled":false,"message":""}');
  try {
    return JSON.parse(raw);
  } catch {
    return { enabled: false, message: "" };
  }
}
