// Geo detection strategy:
// 1. Cloudflare header (free, zero latency — works on any CF-proxied domain)
// 2. ip-api.com free tier fallback (dev only, ~45 req/min limit)
// Returns null on failure — never throw, click recording must not break.

export async function detectGeo(
  req: Request,
  ip: string | null,
): Promise<{ country: string | null; city: string | null }> {
  // Cloudflare sets this for every request — fastest path in production
  const cfCountry = req.headers.get("cf-ipcountry");
  const cfCity = req.headers.get("cf-ipcity"); // available on higher CF plans

  if (cfCountry && cfCountry !== "XX") {
    return { country: cfCountry, city: cfCity ?? null };
  }

  // In development, fall back to free ip-api lookup (HTTP only, no key needed).
  // Private/loopback IPs (127.x, 10.x, 192.168.x, ::1) always return fail,
  // so we omit the IP and let ip-api use the server's own outbound IP instead —
  // which in local dev IS the developer's machine, giving the correct country.
  if (process.env.NODE_ENV !== "production") {
    const isPrivate = !ip || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd)/.test(ip);
    const target = isPrivate ? `http://ip-api.com/json/` : `http://ip-api.com/json/${ip}`;
    try {
      const res = await fetch(
        `${target}?fields=status,country,countryCode,city`,
        { signal: AbortSignal.timeout(2000) },
      );
      if (res.ok) {
        const data = (await res.json()) as {
          status: string;
          country?: string;
          countryCode?: string;
          city?: string;
        };
        if (data.status === "success") {
          return {
            country: data.countryCode ?? data.country ?? null,
            city: data.city ?? null,
          };
        }
      }
    } catch {
      // timeout or network error — ignore
    }
  }

  return { country: null, city: null };
}
