import { useState } from 'react';
import { useData } from '../context/DataContext';
import { YarnCard } from '../components/YarnCard';
import { ProjectCard } from '../components/ProjectCard';
import type { AppData } from '../types';

type Tab = 'yarn' | 'projects';

// Collect color codes for a project, sorted by grams used (most used yarn first).
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
        {(['yarn', 'projects'] as Tab[]).map(t => (
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
              : `Projects (${data.projects.length})`}
          </button>
        ))}
      </div>

      {tab === 'yarn' && (
        data.yarnPurchases.length === 0 ? (
          <p className="text-gray-400 text-sm py-12 text-center">No yarn purchases yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.yarnPurchases.map(p => (
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
            {data.projects.map(p => (
              <ProjectCard
                key={p.projectId}
                project={p}
                swatches={projectSwatches(p.projectId, data)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
