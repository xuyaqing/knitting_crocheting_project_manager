// Extract dominant colors from an image URL using canvas + median-cut quantization.
// No external dependencies. Results are cached by URL.

const cache = new Map<string, string[]>();

/** Load an image with CORS enabled; resolves to the loaded HTMLImageElement. */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
}

// ── Color-space helpers ────────────────────────────────────────────────

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/** Squared Euclidean distance between two RGB colors. */
function colorDistSq(a: [number, number, number], b: [number, number, number]): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

// ── Pixel sampling ─────────────────────────────────────────────────────

/**
 * Sample pixel data from the center half of an image (center 2×2 of a 4×4 grid).
 * Filters out low-saturation pixels (whites, grays, blacks) so backgrounds don't
 * dilute the yarn colors. Falls back to unfiltered if the project is genuinely neutral.
 */
function samplePixels(img: HTMLImageElement): [number, number, number][] {
  const MAX = 50;
  // Source crop: center 50% of each dimension
  const sx = Math.round(img.naturalWidth * 0.25);
  const sy = Math.round(img.naturalHeight * 0.25);
  const sw = Math.round(img.naturalWidth * 0.5);
  const sh = Math.round(img.naturalHeight * 0.5);
  const scale = Math.min(1, MAX / Math.max(sw, sh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const allPixels: [number, number, number][] = [];
  const saturatedPixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // skip transparent
    const rgb: [number, number, number] = [data[i], data[i + 1], data[i + 2]];
    allPixels.push(rgb);
    const [, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    // Keep pixels with meaningful saturation and not too dark / too bright
    if (s > 0.12 && l > 0.1 && l < 0.9) {
      saturatedPixels.push(rgb);
    }
  }
  // Fall back to all pixels if the project is genuinely neutral (gray yarn etc.)
  return saturatedPixels.length > allPixels.length * 0.05 ? saturatedPixels : allPixels;
}

// ── Median-cut quantization ────────────────────────────────────────────

/** Median-cut color quantization — returns `count` representative colors. */
function medianCut(
  pixels: [number, number, number][],
  count: number,
): [number, number, number][] {
  if (pixels.length === 0) return [];

  type Bucket = [number, number, number][];

  function rangeOf(bucket: Bucket): [number, number, number] {
    let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
    for (const [r, g, b] of bucket) {
      if (r < rMin) rMin = r; if (r > rMax) rMax = r;
      if (g < gMin) gMin = g; if (g > gMax) gMax = g;
      if (b < bMin) bMin = b; if (b > bMax) bMax = b;
    }
    return [rMax - rMin, gMax - gMin, bMax - bMin];
  }

  function average(bucket: Bucket): [number, number, number] {
    let rSum = 0, gSum = 0, bSum = 0;
    for (const [r, g, b] of bucket) { rSum += r; gSum += g; bSum += b; }
    const n = bucket.length;
    return [Math.round(rSum / n), Math.round(gSum / n), Math.round(bSum / n)];
  }

  let buckets: Bucket[] = [pixels];

  while (buckets.length < count) {
    let bestIdx = 0;
    let bestRange = 0;
    for (let i = 0; i < buckets.length; i++) {
      const range = rangeOf(buckets[i]);
      const maxR = Math.max(...range);
      if (maxR > bestRange) { bestRange = maxR; bestIdx = i; }
    }
    if (bestRange === 0) break;

    const bucket = buckets.splice(bestIdx, 1)[0];
    const range = rangeOf(bucket);
    const ch = range[0] >= range[1] && range[0] >= range[2] ? 0 : range[1] >= range[2] ? 1 : 2;
    bucket.sort((a, b) => a[ch] - b[ch]);
    const mid = Math.floor(bucket.length / 2);
    buckets.push(bucket.slice(0, mid), bucket.slice(mid));
  }

  return buckets
    .sort((a, b) => b.length - a.length)
    .map(average);
}

// ── Post-processing ────────────────────────────────────────────────────

/** Merge colors that are too similar, keeping the one from the larger bucket. */
function dedup(colors: [number, number, number][], minDist = 50): [number, number, number][] {
  // minDist is in RGB Euclidean distance (not squared)
  const minDistSq = minDist * minDist;
  const kept: [number, number, number][] = [];
  for (const c of colors) {
    if (kept.every(k => colorDistSq(k, c) >= minDistSq)) {
      kept.push(c);
    }
  }
  return kept;
}

/** Mild saturation boost to counteract averaging-induced desaturation. */
function boostSaturation(rgb: [number, number, number], factor = 1.25): [number, number, number] {
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  return hslToRgb(h, Math.min(1, s * factor), l);
}

// ── Public API ─────────────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract dominant colors from an image URL.
 * Returns hex strings like "#a1523f". Similar shades are merged so you may
 * get fewer than `count` colors — that's intentional.
 */
export async function extractColors(url: string, count = 5): Promise<string[]> {
  if (cache.has(url)) return cache.get(url)!;
  try {
    const img = await loadImage(url);
    const pixels = samplePixels(img);
    if (pixels.length === 0) return [];
    const raw = medianCut(pixels, count);
    const unique = dedup(raw);
    const colors = unique.map(c => {
      const boosted = boostSaturation(c);
      return rgbToHex(boosted[0], boosted[1], boosted[2]);
    });
    cache.set(url, colors);
    return colors;
  } catch {
    cache.set(url, []);
    return [];
  }
}
