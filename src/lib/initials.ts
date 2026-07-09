/** Builds a 1-2 letter avatar initial from a name (falling back to email), e.g. "Jane Doe" -> "JD". */
export function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim();
  if (!source) return "?";

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
