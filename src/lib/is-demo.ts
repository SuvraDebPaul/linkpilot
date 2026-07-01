/**
 * Returns true when the current request is running in demo mode.
 * Demo mode activates when NEXT_PUBLIC_DEMO=true is set at build time.
 */
export async function isDemoMode(): Promise<boolean> {
  return process.env.NEXT_PUBLIC_DEMO === "true";
}
