import { useState } from 'react';
import { driveThumb } from '../lib/utils';
import { Photo } from './Photo';

interface Props {
  urls: string[];
  alt: string;
  /** Class applied to a single-photo layout (passed to Photo) */
  singleClassName?: string;
  sizePx?: number;
}

export function PhotoGallery({ urls, alt, singleClassName = '', sizePx = 800 }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const valid = urls.filter(Boolean);
  if (valid.length === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${singleClassName}`}>
        No photo
      </div>
    );
  }

  if (valid.length === 1) {
    return <Photo url={valid[0]} alt={alt} className={singleClassName} sizePx={sizePx} />;
  }

  return (
    <>
      {/* Horizontal scroll strip */}
      <div className="flex gap-2 overflow-x-auto px-1 py-1 scrollbar-thin">
        {valid.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="shrink-0 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <img
              src={driveThumb(url, 400)}
              alt={`${alt} ${i + 1}`}
              referrerPolicy="no-referrer"
              className="h-52 w-auto object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
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
          <button
            className="absolute left-4 text-white text-3xl leading-none disabled:opacity-20"
            disabled={lightbox === 0}
            onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) - 1); }}
          >
            ‹
          </button>
          <img
            src={driveThumb(valid[lightbox], 1600)}
            alt={`${alt} ${lightbox + 1}`}
            referrerPolicy="no-referrer"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute right-4 text-white text-3xl leading-none disabled:opacity-20"
            disabled={lightbox === valid.length - 1}
            onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) + 1); }}
          >
            ›
          </button>
          <span className="absolute bottom-5 text-white/60 text-sm">
            {lightbox + 1} / {valid.length}
          </span>
        </div>
      )}
    </>
  );
}
