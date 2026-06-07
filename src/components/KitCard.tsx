import type { Kit } from '../types';
import { Photo } from './Photo';
import { fmtNum } from '../lib/utils';

interface Props {
  kit: Kit;
}

export function KitCard({ kit }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <Photo url={kit.photoUrl} alt={kit.kitName} className="w-full h-48" />
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-medium text-gray-900 leading-snug">{kit.kitName}</p>
        {kit.brand && <p className="text-sm text-gray-500">{kit.brand}</p>}
        {kit.price && (
          <p className="mt-auto pt-2 text-xs text-gray-400">
            {kit.currency === 'CNY'
              ? `$${(parseFloat(kit.price) / 7).toFixed(2)} USD (¥${fmtNum(kit.price)} CNY)`
              : `$${fmtNum(kit.price)}`}
          </p>
        )}
      </div>
    </div>
  );
}
