import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ColorSwatch } from '../components/ColorSwatch';
import { ProjectCard } from '../components/ProjectCard';
import { Photo } from '../components/Photo';
import type { AppData } from '../types';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-gray-400">{label}: </span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

function projectSwatches(projectId: string, data: AppData): string[] {
  return data.yarnUsed
    .filter(u => u.projectId === projectId)
    .sort((a, b) => {
      const ga = parseFloat(a.actualGramsUsed || a.plannedGrams || '0');
      const gb = parseFloat(b.actualGramsUsed || b.plannedGrams || '0');
      return gb - ga;
    })
    .flatMap(u =>
      data.yarnPurchases
        .filter(p => p.yarnId === u.yarnId)
        .flatMap(p => p.colorCodes)
    );
}

export function YarnDetail() {
  const { yarnId } = useParams<{ yarnId: string }>();
  const { data, loading, error } = useData();

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;
  if (error) return <div className="text-center py-16 text-red-500">Error: {error}</div>;
  if (!data) return null;

  const detail = data.yarnDetails.find(y => y.yarnId === yarnId);
  const purchases = data.yarnPurchases.filter(p => p.yarnId === yarnId);

  const linkedProjectIds = new Set(
    data.yarnUsed.filter(u => u.yarnId === yarnId).map(u => u.projectId)
  );
  const linkedProjects = data.projects.filter(p => linkedProjectIds.has(p.projectId));

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
          {detail?.yardage && <InfoRow label="Yardage" value={`${detail.yardage}y`} />}
          {detail?.fiber && <InfoRow label="Fiber" value={detail.fiber} />}
          {detail?.availableColor && <InfoRow label="Available colors" value={detail.availableColor} />}
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
                <Photo url={p.photoUrl} alt={p.color} className="w-full h-52" sizePx={600} />
                <div className="p-4">
                  <p className="font-medium text-gray-900 mb-1">{p.color}</p>
                  <ColorSwatch codes={p.colorCodes} size="md" />
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                    {p.totalGrams && <InfoRow label="Total" value={`${p.totalGrams}g`} />}
                    {p.gramsPerSkein && <InfoRow label="Per skein" value={`${p.gramsPerSkein}g`} />}
                    {p.quantity && <InfoRow label="Quantity" value={p.quantity} />}
                    {p.totalYardage && <InfoRow label="Yardage" value={`${p.totalYardage}y`} />}
                    {p.pricePaid && (
                      <InfoRow label="Price" value={`${p.pricePaid} ${p.currency}`} />
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
                swatches={projectSwatches(p.projectId, data)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
