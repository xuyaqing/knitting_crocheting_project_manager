import { Link } from 'react-router-dom';
import type { YarnPurchase, YarnDetail } from '../types';
import { ColorSwatch } from './ColorSwatch';
import { Photo } from './Photo';
import { remainingMeters } from '../lib/utils';

interface Props {
  purchase: YarnPurchase;
  detail?: YarnDetail;
}

export function YarnCard({ purchase, detail }: Props) {
  const meters = remainingMeters(purchase);
  return (
    <Link to={`/yarn/${purchase.yarnId}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200 overflow-hidden border border-gray-200/70 h-full flex flex-col">
        <Photo url={purchase.photoUrls[0] ?? ''} alt={purchase.color} className="w-full h-48" />
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="font-display font-semibold text-gray-900 leading-snug">
            {detail?.brand && <span className="text-gray-500 font-normal">{detail.brand} </span>}
            {detail?.yarnName ?? purchase.yarnId}
          </p>
          <p className="text-sm text-gray-600 truncate">{purchase.color}</p>
          <div className="mt-auto pt-2 flex items-end justify-between gap-2">
            <ColorSwatch codes={purchase.colorCodes} />
            <div className="text-right text-xs text-gray-400 shrink-0">
              {purchase.remainingGrams && <div>{purchase.remainingGrams}g</div>}
              {meters !== null && <div>{meters.toFixed(0)}m left</div>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
