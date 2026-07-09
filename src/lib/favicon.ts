export function faviconUrl(originalUrl: string): string | null {
  try {
    const host = new URL(originalUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}
