export function fmtNum(value: string): string {
  const n = parseFloat(value);
  return isNaN(n) ? value : n.toFixed(2);
}

// Estimate the remaining length in meters from the remaining grams, using the
// purchase's grams-to-length ratio (total length / total grams). Returns null
// when the inputs are missing or non-positive so callers can skip rendering.
export function remainingMeters(p: {
  remainingGrams: string;
  totalGrams: string;
  totalYardage: string;
}): number | null {
  const grams = parseFloat(p.remainingGrams);
  const totalGrams = parseFloat(p.totalGrams);
  const totalMeters = parseFloat(p.totalYardage);
  if (isNaN(grams) || isNaN(totalGrams) || isNaN(totalMeters) || totalGrams <= 0) {
    return null;
  }
  return grams * (totalMeters / totalGrams);
}

// Convert any Google Drive share/view URL to a direct embed URL via lh3.googleusercontent.com.
// This CDN is what Google uses internally for Docs/Slides embeds and works without authentication
// for publicly shared files. Non-Drive URLs are returned unchanged.
export function driveThumb(url: string, sizePx = 400): string {
  if (!url) return '';
  const byPath = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (byPath) return `https://lh3.googleusercontent.com/d/${byPath[1]}=w${sizePx}`;
  const byParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (byParam) return `https://lh3.googleusercontent.com/d/${byParam[1]}=w${sizePx}`;
  return url;
}
