import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ColorSwatch } from '../components/ColorSwatch';
import { ProjectCard } from '../components/ProjectCard';
import { PhotoGallery } from '../components/PhotoGallery';
import { Photo } from '../components/Photo';
import type { AppData, Project } from '../types';
import { fmtNum, remainingMeters } from '../lib/utils';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-gray-400">{label}: </span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

function yarnSlotsOf(project: Project): string[] {
  return [project.yarn1, project.yarn2, project.yarn3, project.yarn4, project.yarn5].filter(Boolean);
}

function projectSwatches(project: Project, data: AppData): string[] {
  const slots = [
    { id: project.yarn1, g: project.yarn1GUsed },
    { id: project.yarn2, g: project.yarn2GUsed },
    { id: project.yarn3, g: project.yarn3GUsed },
    { id: project.yarn4, g: project.yarn4GUsed },
    { id: project.yarn5, g: project.yarn5GUsed },
  ].filter(s => s.id);
  slots.sort((a, b) => parseFloat(b.g || '0') - parseFloat(a.g || '0'));
  return slots.flatMap(s => {
    const purchase = data.yarnPurchases.find(p => p.purchaseId === s.id);
    return purchase?.colorCodes ?? [];
  });
}

export function YarnDetail() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const { data, loading, error } = useData();

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;
  if (error) return <div className="text-center py-16 text-red-500">Error: {error}</div>;
  if (!data) return null;

  const purchase = data.yarnPurchases.find(p => p.purchaseId === purchaseId);
  if (!purchase) {
    return <div className="text-center py-16 text-gray-400">Yarn not found.</div>;
  }

  const detail = data.yarnDetails.find(y => y.yarnId === purchase.yarnId);
  const meters = remainingMeters(purchase);

  // Projects that use this specific colorway
  const linkedProjects = data.projects.filter(p =>
    yarnSlotsOf(p).includes(purchase.purchaseId)
  );

  // Other colorways of the same yarn (excluding this one)
  const otherColorways = data.yarnPurchases.filter(
    p => p.yarnId === purchase.yarnId && p.purchaseId !== purchase.purchaseId
  );

  return (
    <div>
      <Link to="/?tab=yarn" className="text-sm text-gray-400 hover:text-gray-600 mb-5 inline-block">
        ← Back to gallery
      </Link>

      {/* Hero photo */}
      <PhotoGallery urls={purchase.photoUrls} alt={purchase.color} singleClassName="w-full h-64 sm:h-80 rounded-xl" sizePx={800} />

      {/* Yarn & colorway info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {detail?.brand && <span className="text-gray-500 font-medium">{detail.brand} </span>}
          {detail?.yarnName ?? purchase.yarnId}
        </h1>
        <p className="text-lg text-gray-600 mt-1">{purchase.color}</p>
        <ColorSwatch codes={purchase.colorCodes} size="md" />

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1.5">
          {detail?.weight && <InfoRow label="Weight" value={detail.weight} />}
          {detail?.fiber && <InfoRow label="Fiber" value={detail.fiber} />}
          {purchase.totalGrams && <InfoRow label="Total" value={`${purchase.totalGrams}g`} />}
          {purchase.remainingGrams && <InfoRow label="Remaining" value={`${purchase.remainingGrams}g`} />}
          {purchase.gramsPerSkein && <InfoRow label="Per skein" value={`${purchase.gramsPerSkein}g`} />}
          {purchase.yardage && <InfoRow label="Length/skein" value={`${purchase.yardage}m`} />}
          {purchase.quantity && <InfoRow label="Quantity" value={purchase.quantity} />}
          {purchase.totalYardage && <InfoRow label="Total length" value={`${purchase.totalYardage}m`} />}
          {meters !== null && <InfoRow label="Remaining length" value={`${meters.toFixed(0)}m`} />}
          {purchase.pricePaid && (
            <InfoRow label="Price" value={`${fmtNum(purchase.pricePaid)} ${purchase.currency}`} />
          )}
          {purchase.source && <InfoRow label="Source" value={purchase.source} />}
          {purchase.status && <InfoRow label="Status" value={purchase.status} />}
        </div>
        {detail?.notes && <p className="mt-3 text-sm text-gray-500 italic">{detail.notes}</p>}
      </div>

      {/* Used in */}
      {linkedProjects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Used in</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {linkedProjects.map(p => (
              <ProjectCard
                key={p.projectId}
                project={p}
                swatches={projectSwatches(p, data)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Other colorways owned */}
      {otherColorways.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Other colorways owned ({otherColorways.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherColorways.map(p => (
              <Link key={p.purchaseId} to={`/yarn/${p.purchaseId}`} className="block group">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200">
                  <Photo url={p.photoUrls[0] ?? ''} alt={p.color} className="w-full h-52" sizePx={600} />
                  <div className="p-4">
                    <p className="font-medium text-gray-900 mb-1">{p.color}</p>
                    <ColorSwatch codes={p.colorCodes} size="md" />
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                      {p.remainingGrams && <InfoRow label="Remaining" value={`${p.remainingGrams}g`} />}
                      {p.totalGrams && <InfoRow label="Total" value={`${p.totalGrams}g`} />}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
