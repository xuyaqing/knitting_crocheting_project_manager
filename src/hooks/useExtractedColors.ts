import { useEffect, useState } from 'react';
import { extractColors } from '../lib/extractColors';
import { driveThumb } from '../lib/utils';

/**
 * Extract dominant colors from an image URL.
 * Uses a small thumbnail for speed. Returns [] while loading or on failure.
 */
export function useExtractedColors(photoUrl: string | undefined, count = 5): string[] {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    if (!photoUrl) return;
    let cancelled = false;
    // Use a small thumbnail for fast extraction
    const thumbUrl = driveThumb(photoUrl, 100);
    extractColors(thumbUrl, count).then(result => {
      if (!cancelled) setColors(result);
    });
    return () => { cancelled = true; };
  }, [photoUrl, count]);

  return colors;
}
