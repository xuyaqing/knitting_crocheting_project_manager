import { useState } from 'react';
import { driveThumb } from '../lib/utils';

interface Props {
  url: string;
  alt: string;
  className?: string;
  sizePx?: number;
  fit?: 'cover' | 'contain';
}

export function Photo({ url, alt, className = '', sizePx = 400, fit = 'cover' }: Props) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs gap-1.5 ${className}`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M6 9c3 1 6 3.5 7.5 8M9 5c.5 3.5 2.5 7 7 8.5" opacity="0.7" />
        </svg>
        No photo
      </div>
    );
  }
  return (
    <img
      src={driveThumb(url, sizePx)}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
