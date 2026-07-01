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
