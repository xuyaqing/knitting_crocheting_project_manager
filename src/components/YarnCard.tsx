import { Link } from 'react-router-dom';
import type { YarnPurchase, YarnDetail } from '../types';
import { ColorSwatch } from './ColorSwatch';
import { Photo } from './Photo';
import { fmtNum } from '../lib/utils';

interface Props {
  purchase: YarnPurchase;
  detail?: YarnDetail;
}

export function YarnCard({ purchase, detail }: Props) {
  return (
    <Link to={`/yarn/${purchase.yarnId}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 h-full flex flex-col">
        <Photo url={purchase.photoUrls[0] ?? ''} alt={purchase.color} className="w-full h-48" />
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="font-medium text-gray-900 leading-snug">
            {detail?.brand && <span className="text-gray-500 font-normal">{detail.brand} </span>}
            {detail?.yarnName ?? purchase.yarnId}
          </p>
          <p className="text-sm text-gray-600 truncate">{purchase.color}</p>
          <div className="mt-auto pt-2 flex items-end justify-between gap-2">
            <ColorSwatch codes={purchase.colorCodes} />
            <div className="text-right text-xs text-gray-400 shrink-0">
              {purchase.totalGrams && <div>{purchase.totalGrams}g</div>}
              {purchase.pricePaid && (
                <div>{fmtNum(purchase.pricePaid)} {purchase.currency}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
