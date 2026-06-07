import { useState } from 'react';
import { useData } from '../context/DataContext';
import { YarnCard } from '../components/YarnCard';
import { ProjectCard } from '../components/ProjectCard';
import { KitCard } from '../components/KitCard';
import type { AppData, Project } from '../types';

type Tab = 'yarn' | 'projects' | 'kits';

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

export function Gallery() {
  const { data, loading, error } = useData();
  const [tab, setTab] = useState<Tab>('yarn');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Loading your stash...
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500 font-medium">Could not load data</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  const yarnDetailMap = new Map(data.yarnDetails.map(y => [y.yarnId, y]));

  return (
    <div>
      <div className="flex gap-0 mb-6 border-b border-gray-200">
        {(['yarn', 'projects', 'kits'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'yarn'
              ? `Yarn (${data.yarnPurchases.length})`
              : t === 'projects'
              ? `Projects (${data.projects.length})`
              : `Kits (${data.kits.length})`}
          </button>
        ))}
      </div>

      {tab === 'yarn' && (
        data.yarnPurchases.length === 0 ? (
          <p className="text-gray-400 text-sm py-12 text-center">No yarn purchases yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...data.yarnPurchases]
              .sort((a, b) => a.purchaseId.localeCompare(b.purchaseId))
              .map(p => (
                <YarnCard key={p.purchaseId} purchase={p} detail={yarnDetailMap.get(p.yarnId)} />
              ))}
          </div>
        )
      )}

      {tab === 'projects' && (
        data.projects.length === 0 ? (
          <p className="text-gray-400 text-sm py-12 text-center">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...data.projects]
              .sort((a, b) => {
                const order: Record<string, number> = { 'Done': 0, 'In Progress': 1, 'Planned': 2 };
                return (order[a.status] ?? 3) - (order[b.status] ?? 3);
              })
              .map(p => (
              <ProjectCard
                key={p.projectId}
                project={p}
                swatches={projectSwatches(p, data)}
              />
            ))}
          </div>
        )
      )}

      {tab === 'kits' && (
        data.kits.length === 0 ? (
          <p className="text-gray-400 text-sm py-12 text-center">No kits yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.kits.map(k => (
              <KitCard key={k.kitId} kit={k} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
