import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ColorSwatch } from '../components/ColorSwatch';
import { ProjectCard } from '../components/ProjectCard';
import { PhotoGallery } from '../components/PhotoGallery';
import type { AppData, Project } from '../types';
import { fmtNum } from '../lib/utils';

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
  const { yarnId } = useParams<{ yarnId: string }>();
  const { data, loading, error } = useData();

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;
  if (error) return <div className="text-center py-16 text-red-500">Error: {error}</div>;
  if (!data) return null;

  const detail = data.yarnDetails.find(y => y.yarnId === yarnId);
  const purchases = data.yarnPurchases.filter(p => p.yarnId === yarnId);

  // Find projects that reference any purchase of this yarn
  const purchaseIds = new Set(purchases.map(p => p.purchaseId));
  const linkedProjects = data.projects.filter(p =>
    yarnSlotsOf(p).some(id => purchaseIds.has(id))
  );

  if (!detail && purchases.length === 0) {
    return <div className="text-center py-16 text-gray-400">Yarn not found.</div>;
  }

  return (
    <div>
      <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 mb-5 inline-block">
        ← Back to gallery
      </Link>

      {/* Yarn header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {detail?.brand && <span className="text-gray-500 font-medium">{detail.brand} </span>}
          {detail?.yarnName ?? yarnId}
        </h1>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1.5">
          {detail?.weight && <InfoRow label="Weight" value={detail.weight} />}
          {detail?.fiber && <InfoRow label="Fiber" value={detail.fiber} />}
        </div>
        {detail?.notes && <p className="mt-3 text-sm text-gray-500 italic">{detail.notes}</p>}
      </div>

      {/* Colorways */}
      {purchases.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            Colorways owned ({purchases.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchases.map(p => (
              <div
                key={p.purchaseId}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <PhotoGallery urls={p.photoUrls} alt={p.color} singleClassName="w-full h-52" sizePx={600} />
                <div className="p-4">
                  <p className="font-medium text-gray-900 mb-1">{p.color}</p>
                  <p className="text-xs text-gray-400 mb-2">{p.purchaseId}</p>
                  <ColorSwatch codes={p.colorCodes} size="md" />
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                    {p.totalGrams && <InfoRow label="Total" value={`${p.totalGrams}g`} />}
                    {p.remainingGrams && <InfoRow label="Remaining" value={`${p.remainingGrams}g`} />}
                    {p.gramsPerSkein && <InfoRow label="Per skein" value={`${p.gramsPerSkein}g`} />}
                    {p.yardage && <InfoRow label="Yardage/skein" value={`${p.yardage}y`} />}
                    {p.quantity && <InfoRow label="Quantity" value={p.quantity} />}
                    {p.totalYardage && <InfoRow label="Total yardage" value={`${p.totalYardage}y`} />}
                    {p.pricePaid && (
                      <InfoRow label="Price" value={`${fmtNum(p.pricePaid)} ${p.currency}`} />
                    )}
                    {p.source && <InfoRow label="Source" value={p.source} />}
                    {p.date && <InfoRow label="Purchased" value={p.date} />}
                    {p.status && <InfoRow label="Status" value={p.status} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Linked projects */}
      {linkedProjects.length > 0 && (
        <section>
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
    </div>
  );
}
