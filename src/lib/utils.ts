export function fmtNum(value: string): string {
  const n = parseFloat(value);
  return isNaN(n) ? value : n.toFixed(2);
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
