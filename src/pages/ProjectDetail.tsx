import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ColorSwatch } from '../components/ColorSwatch';
import { Photo } from '../components/Photo';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-gray-400">{label}: </span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data, loading, error } = useData();

  if (loading) return <div className="text-center py-16 text-gray-400">Loading...</div>;
  if (error) return <div className="text-center py-16 text-red-500">Error: {error}</div>;
  if (!data) return null;

  const project = data.projects.find(p => p.projectId === projectId);
  if (!project) return <div className="text-center py-16 text-gray-400">Project not found.</div>;

  const yarnsUsed = data.yarnUsed.filter(u => u.projectId === projectId);
  const yarnDetailMap = new Map(data.yarnDetails.map(y => [y.yarnId, y]));

  const firstPurchaseMap = new Map(
    data.yarnDetails.map(y => {
      const purchases = data.yarnPurchases.filter(p => p.yarnId === y.yarnId);
      const withPhoto = purchases.find(p => p.photoUrl);
      return [y.yarnId, withPhoto ?? purchases[0]];
    })
  );

  return (
    <div>
      <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 mb-5 inline-block">
        ← Back to gallery
      </Link>

      {/* Project header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {project.photoUrl && (
          <Photo url={project.photoUrl} alt={project.projectName} className="w-full max-h-80" sizePx={800} />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
            {project.status && (
              <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
                {project.status}
              </span>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1.5">
            {project.type && <InfoRow label="Type" value={project.type} />}
            {project.pattern && <InfoRow label="Pattern" value={project.pattern} />}
            {project.needleHookSize && <InfoRow label="Hook / Needle" value={project.needleHookSize} />}
            {project.startDate && <InfoRow label="Started" value={project.startDate} />}
            {project.endDate && <InfoRow label="Finished" value={project.endDate} />}
            {project.totalMaterialCost && project.totalMaterialCost !== 'N/A' && (
              <InfoRow label="Total material cost" value={`$${project.totalMaterialCost}`} />
            )}
          </div>
          {project.notes && <p className="mt-3 text-sm text-gray-500 italic">{project.notes}</p>}
          {project.tutorialLink && (
            <a
              href={project.tutorialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-rose-600 hover:text-rose-700 underline underline-offset-2"
            >
              View tutorial
            </a>
          )}
        </div>
      </div>

      {/* Yarns used */}
      {yarnsUsed.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Yarns used</h2>
          <div className="space-y-3">
            {yarnsUsed.map((u, i) => {
              const detail = yarnDetailMap.get(u.yarnId);
              const purchase = firstPurchaseMap.get(u.yarnId);
              return (
                <Link key={i} to={`/yarn/${u.yarnId}`} className="block">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow flex gap-4">
                    <Photo
                      url={purchase?.photoUrl ?? ''}
                      alt={purchase?.color ?? ''}
                      className="w-20 h-20 rounded-lg shrink-0"
                      sizePx={160}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {detail?.brand && (
                          <span className="text-gray-500 font-normal">{detail.brand} </span>
                        )}
                        {detail?.yarnName ?? u.yarnId}
                      </p>
                      {purchase && (
                        <div className="mt-1 flex items-center gap-2">
                          <ColorSwatch codes={purchase.colorCodes} />
                          <span className="text-sm text-gray-500">{purchase.color}</span>
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-500">
                        {u.plannedGrams && <span>Planned: {u.plannedGrams}g</span>}
                        {u.actualGramsUsed && <span>Actual: {u.actualGramsUsed}g</span>}
                        {u.cost && u.cost !== 'N/A' && <span>Cost: ${u.cost}</span>}
                      </div>
                      {u.notes && <p className="mt-1 text-xs text-gray-400">{u.notes}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
