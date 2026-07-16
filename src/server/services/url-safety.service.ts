import { prisma } from "@/server/db/prisma";

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  // IPv6 loopback / link-local / private
  if (h === "::1" || h === "::") return true;
  if (h.startsWith("fc") || h.startsWith("fd")) return true;
  if (h.startsWith("fe80")) return true;

  // Named local hosts
  if (h === "localhost" || h.endsWith(".localhost")) return true;

  // IPv4 private / loopback / link-local / cloud metadata
  const privatePatterns = [
    /^127\./,
    /^0\.0\.0\.0$/,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
  ];

  return privatePatterns.some((p) => p.test(h));
}

export function validateSafeUrl(value: string) {
  const url = new URL(value);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }

  if (isPrivateHostname(url.hostname)) {
    throw new Error("Redirecting to local or private addresses is not allowed.");
  }

  return url.toString();
}

// Checked separately from validateSafeUrl (which is synchronous) since this
// needs a DB lookup against BlockedDomain, maintained from /admin/moderation.
// A hostname matches if it equals a blocked entry exactly, or is a subdomain
// of one (blocking "evil.com" also blocks "sub.evil.com").
export async function assertDomainNotBlocked(value: string) {
  const hostname = new URL(value).hostname.toLowerCase();

  const blocked = await prisma.blockedDomain.findMany({ select: { domain: true } });
  const match = blocked.find(
    (b) => hostname === b.domain || hostname.endsWith(`.${b.domain}`),
  );
  if (match) {
    throw new Error(`Links to ${match.domain} are not allowed.`);
  }
}
