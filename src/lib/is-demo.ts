import { headers } from "next/headers";

/**
 * Returns true when the current request is running in demo mode.
 *
 * Demo mode activates if EITHER:
 *  - NEXT_PUBLIC_DEMO=true was set at build time (for dedicated demo deployments), OR
 *  - the proxy injected x-demo-mode=true (when the request came via demo.* subdomain)
 *
 * Call this inside async server components / route handlers — not at module level.
 */
export async function isDemoMode(): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_DEMO === "true") return true;
  try {
    const h = await headers();
    return h.get("x-demo-mode") === "true";
  } catch {
    return false;
  }
}
