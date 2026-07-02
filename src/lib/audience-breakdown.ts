export type AudienceDataPoint = { name: string; count: number };

// Matches the real detection output in lib/user-agent.ts (top values only,
// plus one placeholder that real detection can't identify from a UA string).
export const CANONICAL_BROWSERS = ["Chrome", "Safari", "Firefox", "Edge", "Brave", "Other"];
export const CANONICAL_OS = ["Windows", "macOS", "Android", "iOS", "Linux", "Other"];

/**
 * Pads a data set out to a fixed 6 entries using canonical labels, so charts
 * and their accompanying breakdown tables always have the same shape whether
 * a workspace has rich click data or almost none yet.
 */
export function padToSix(data: AudienceDataPoint[], canonical: string[]): AudienceDataPoint[] {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const present = new Set(sorted.map((d) => d.name));
  for (const name of canonical) {
    if (sorted.length >= 6) break;
    if (!present.has(name)) sorted.push({ name, count: 0 });
  }
  return sorted.slice(0, 6);
}
