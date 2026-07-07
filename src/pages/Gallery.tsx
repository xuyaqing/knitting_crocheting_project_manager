import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { YarnCard } from '../components/YarnCard';
import { ProjectCard } from '../components/ProjectCard';
import { KitCard } from '../components/KitCard';
import type { AppData, Project } from '../types';

type Tab = 'yarn' | 'projects' | 'planned' | 'interested' | 'kits';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: Tab = tabParam === 'projects' || tabParam === 'planned' || tabParam === 'interested' || tabParam === 'kits' ? tabParam : 'yarn';
  const setTab = (t: Tab) =>
    setSearchParams(t === 'yarn' ? {} : { tab: t }, { replace: true });

  // Remember scroll position per tab so returning from a detail page lands where you were.
  useEffect(() => {
    const key = `gallery-scroll-${tab}`;
    const saved = sessionStorage.getItem(key);
    window.scrollTo(0, saved ? parseInt(saved, 10) : 0);
    const onScroll = () => sessionStorage.setItem(key, String(window.scrollY));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [tab]);

  if (loading) {
    return (
      <div>
        <div className="h-6 w-40 rounded-full bg-gray-200/70 animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="w-full h-48 bg-gray-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 w-3/4 rounded-full bg-gray-200/70 animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-20 text-center max-w-sm mx-auto">
        <p className="font-display text-lg text-gray-800">A dropped stitch</p>
        <p className="text-sm text-gray-500 mt-1">We couldn't load your stash just now.</p>
        <p className="text-xs text-gray-400 mt-3 font-mono">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  const yarnDetailMap = new Map(data.yarnDetails.map(y => [y.yarnId, y]));

  return (
    <div>
      <div className="flex gap-0 mb-6 border-b border-gray-200">
        {(['yarn', 'projects', 'planned', 'interested', 'kits'] as Tab[]).map(t => {
          const activeProjects = data.projects.filter(p => p.status !== 'Interested' && p.status !== 'Planned');
          const plannedProjects = data.projects.filter(p => p.status === 'Planned');
          const interestedProjects = data.projects.filter(p => p.status === 'Interested');
          const label =
            t === 'yarn' ? `Yarn (${data.yarnPurchases.length})`
            : t === 'projects' ? `Projects (${activeProjects.length})`
            : t === 'planned' ? `Planned (${plannedProjects.length})`
            : t === 'interested' ? `Interested (${interestedProjects.length})`
            : `Kits (${data.kits.length})`;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === 'yarn' && (
        data.yarnPurchases.length === 0 ? (
          <p className="font-display text-gray-500 py-16 text-center">Your stash is empty — add some yarn to begin.</p>
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

      {tab === 'projects' && (() => {
        const activeProjects = [...data.projects]
          .filter(p => p.status !== 'Interested' && p.status !== 'Planned')
          .sort((a, b) => {
            const order: Record<string, number> = { 'Done': 0, 'In Progress': 1 };
            return (order[a.status] ?? 3) - (order[b.status] ?? 3);
          });
        return activeProjects.length === 0 ? (
          <p className="font-display text-gray-500 py-16 text-center">No projects yet — your next make starts here.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeProjects.map(p => (
              <ProjectCard key={p.projectId} project={p} swatches={projectSwatches(p, data)} />
            ))}
          </div>
        );
      })()}

      {tab === 'planned' && (() => {
        const plannedProjects = data.projects.filter(p => p.status === 'Planned');
        return plannedProjects.length === 0 ? (
          <p className="font-display text-gray-500 py-16 text-center">No planned projects yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {plannedProjects.map(p => (
              <ProjectCard key={p.projectId} project={p} swatches={projectSwatches(p, data)} />
            ))}
          </div>
        );
      })()}

      {tab === 'interested' && (() => {
        const interestedProjects = data.projects.filter(p => p.status === 'Interested');
        return interestedProjects.length === 0 ? (
          <p className="font-display text-gray-500 py-16 text-center">No interested projects yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {interestedProjects.map(p => (
              <ProjectCard key={p.projectId} project={p} swatches={projectSwatches(p, data)} />
            ))}
          </div>
        );
      })()}

      {tab === 'kits' && (
        data.kits.length === 0 ? (
          <p className="font-display text-gray-500 py-16 text-center">No kits yet.</p>
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
