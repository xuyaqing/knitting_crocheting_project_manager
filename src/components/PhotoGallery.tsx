import { useRef, useState } from 'react';
import { driveThumb } from '../lib/utils';

interface Props {
  urls: string[];
  alt: string;
  /** Class applied to the carousel image (e.g. width + max-height) */
  singleClassName?: string;
  sizePx?: number;
}

export function PhotoGallery({ urls, alt, singleClassName = '', sizePx = 800 }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const valid = urls.filter(Boolean);
  if (valid.length === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${singleClassName}`}>
        No photo
      </div>
    );
  }

  const many = valid.length > 1;
  const idx = Math.min(current, valid.length - 1);
  const go = (n: number) => setCurrent((idx + n + valid.length) % valid.length);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const lightboxEl =
    lightbox !== null ? (
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        onClick={() => setLightbox(null)}
      >
        <button
          className="absolute top-4 right-5 text-white text-2xl leading-none"
          onClick={() => setLightbox(null)}
        >
          ✕
        </button>
        {many && (
          <button
            className="absolute left-4 text-white text-3xl leading-none disabled:opacity-20"
            disabled={lightbox === 0}
            onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) - 1); }}
          >
            ‹
          </button>
        )}
        <img
          src={driveThumb(valid[lightbox], 1600)}
          alt={`${alt} ${lightbox + 1}`}
          referrerPolicy="no-referrer"
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          onClick={e => e.stopPropagation()}
        />
        {many && (
          <button
            className="absolute right-4 text-white text-3xl leading-none disabled:opacity-20"
            disabled={lightbox === valid.length - 1}
            onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) + 1); }}
          >
            ›
          </button>
        )}
        {many && (
          <span className="absolute bottom-5 text-white/60 text-sm">
            {lightbox + 1} / {valid.length}
          </span>
        )}
      </div>
    ) : null;

  return (
    <>
      <div
        className="group relative w-full bg-gray-100"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          onClick={() => setLightbox(idx)}
          className="block w-full focus:outline-none"
          aria-label="Enlarge photo"
        >
          <img
            src={driveThumb(valid[idx], sizePx)}
            alt={`${alt} ${idx + 1}`}
            referrerPolicy="no-referrer"
            className={`object-contain mx-auto ${singleClassName}`}
            loading="lazy"
          />
          <span className="absolute bottom-2 right-2 rounded-full bg-black/40 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ⤢ Enlarge
          </span>
        </button>

        {many && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white text-gray-700 text-xl leading-none flex items-center justify-center shadow-sm"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white text-gray-700 text-xl leading-none flex items-center justify-center shadow-sm"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {valid.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxEl}
    </>
  );
}
