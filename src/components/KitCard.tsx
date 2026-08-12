import type { Kit } from '../types';
import { Photo } from './Photo';

interface Props {
  kit: Kit;
}

export function KitCard({ kit }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/70 h-full flex flex-col overflow-hidden">
      <Photo url={kit.photoUrl} alt={kit.kitName} className="w-full h-48" />
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-display font-semibold text-gray-900 leading-snug">{kit.kitName}</p>
        {kit.brand && <p className="text-sm text-gray-500">{kit.brand}</p>}
      </div>
    </div>
  );
}
