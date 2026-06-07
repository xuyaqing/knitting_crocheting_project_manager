import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ColorSwatch } from '../components/ColorSwatch';
import { Photo } from '../components/Photo';
import { PhotoGallery } from '../components/PhotoGallery';
import { fmtNum } from '../lib/utils';

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

  const purchaseMap = new Map(data.yarnPurchases.map(p => [p.purchaseId, p]));
  const yarnDetailMap = new Map(data.yarnDetails.map(y => [y.yarnId, y]));

  const yarnSlots = [
    { purchaseId: project.yarn1, gUsed: project.yarn1GUsed },
    { purchaseId: project.yarn2, gUsed: project.yarn2GUsed },
    { purchaseId: project.yarn3, gUsed: project.yarn3GUsed },
    { purchaseId: project.yarn4, gUsed: project.yarn4GUsed },
    { purchaseId: project.yarn5, gUsed: project.yarn5GUsed },
  ].filter(s => s.purchaseId);

  return (
    <div>
      <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 mb-5 inline-block">
        ← Back to gallery
      </Link>

      {/* Project header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {project.photoUrls.length > 0 && (
          <PhotoGallery urls={project.photoUrls} alt={project.projectName} singleClassName="w-full max-h-80" sizePx={800} />
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
              <InfoRow label="Total material cost" value={`$${fmtNum(project.totalMaterialCost)}`} />
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
      {yarnSlots.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Yarns used</h2>
          <div className="space-y-3">
            {yarnSlots.map((slot, i) => {
              const purchase = purchaseMap.get(slot.purchaseId);
              const detail = purchase ? yarnDetailMap.get(purchase.yarnId) : undefined;
              return (
                <Link key={i} to={`/yarn/${purchase?.yarnId}`} className="block">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow flex gap-4">
                    <Photo
                      url={purchase?.photoUrls[0] ?? ''}
                      alt={purchase?.color ?? ''}
                      className="w-20 h-20 rounded-lg shrink-0"
                      sizePx={160}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {detail?.brand && (
                          <span className="text-gray-500 font-normal">{detail.brand} </span>
                        )}
                        {detail?.yarnName ?? slot.purchaseId}
                      </p>
                      {purchase && (
                        <div className="mt-1 flex items-center gap-2">
                          <ColorSwatch codes={purchase.colorCodes} />
                          <span className="text-sm text-gray-500">{purchase.color}</span>
                        </div>
                      )}
                      {slot.gUsed && (
                        <div className="mt-2 text-sm text-gray-500">
                          Used: {slot.gUsed}g
                        </div>
                      )}
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
