import { useState } from 'react';
import { driveThumb } from '../lib/utils';

interface Props {
  url: string;
  alt: string;
  className?: string;
  sizePx?: number;
}

export function Photo({ url, alt, className = '', sizePx = 400 }: Props) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${className}`}>
        No photo
      </div>
    );
  }
  return (
    <img
      src={driveThumb(url, sizePx)}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`object-cover ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
