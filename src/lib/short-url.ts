import { siteConfig } from "@/config/site";

/**
 * Builds a link's public short URL, using its assigned verified custom
 * domain when it has one, falling back to the app's own domain otherwise.
 */
export function getShortUrl(
  shortCode: string,
  customDomain?: { domain: string } | null,
): string {
  if (customDomain?.domain)
    return `https://${customDomain.domain}/${shortCode}`;
  return `${siteConfig.url}/${shortCode}`;
}
