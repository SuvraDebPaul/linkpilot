import dns from "dns/promises";

export async function checkDomainCname(domain: string): Promise<boolean> {
  const expectedTarget = process.env.APP_DOMAIN ?? "linkpilot.app";
  try {
    const addresses = await dns.resolveCname(domain);
    return addresses.some((a) => a.includes(expectedTarget));
  } catch {
    return false;
  }
}
