import { Link } from 'react-router-dom';
import type { Project } from '../types';
import { Photo } from './Photo';
import { ColorSwatch } from './ColorSwatch';
import { fmtNum } from '../lib/utils';

const STATUS_COLORS: Record<string, string> = {
  'Done': 'bg-green-100 text-green-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Planned': 'bg-amber-100 text-amber-700',
  'Frogged': 'bg-red-100 text-red-700',
  'On Hold': 'bg-gray-100 text-gray-600',
};

function statusBadge(status: string) {
  return STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600';
}

interface Props {
  project: Project;
  swatches?: string[];
}

export function ProjectCard({ project, swatches }: Props) {
  return (
    <Link to={`/project/${project.projectId}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200 overflow-hidden border border-gray-200/70 h-full flex flex-col">
        <Photo url={project.photoUrls[0] ?? ''} alt={project.projectName} className="w-full h-48" />
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="font-display font-semibold text-gray-900 leading-snug">{project.projectName}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {project.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(project.status)}`}>
                {project.status}
              </span>
            )}
            {project.type && <span className="text-xs text-gray-400">{project.type}</span>}
          </div>
          <div className="mt-auto pt-2 flex items-end justify-between gap-2">
            {swatches && swatches.length > 0 && <ColorSwatch codes={swatches} />}
            {project.totalMaterialCost && project.totalMaterialCost !== 'N/A' && (
              <p className="text-xs text-gray-400 shrink-0">${fmtNum(project.totalMaterialCost)}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
