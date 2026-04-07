import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

import { cn, formatDate, calculateDaysRemaining, getPhaseStatusCounts } from '@/lib/utils';
import { PROJECT_TYPES } from '@/lib/constants';
import type { IProject, IProjectPhase, PhaseStatus } from '@/lib/types';

export interface ProjectCardProps {
  project: IProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const phases = project.project_phases || [];

  const completedCount = phases.filter(p => p.status === 'completed').length;
  const totalPhases = phases.length || 10;
  const completionPercentage = Math.round((completedCount / totalPhases) * 100);
  const { days, isOverdue } = calculateDaysRemaining(project.target_end_date);

  const projectType = PROJECT_TYPES.find(t => t.value === project.project_type);
  const typeIcon = getProjectTypeIcon(project.project_type);

  const statusCounts = getPhaseStatusCounts(phases);

  return (
    <Card
      className="cursor-pointer hover:border-[var(--color-secondary)] transition-all"
      onClick={() => navigate(`/projects/${project.id}`)}
    >

      {/* Top row: Project name + Status badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-[#1A1A2E] truncate flex-1">
          {project.name.length > 40 ? project.name.slice(0, 40) + '...' : project.name}
        </h3>
        <Badge status={project.status as any} label={project.status} />

      </div>

      {/* Second row: Client name */}
      <p className="text-sm text-[#6B7280] mb-3">{project.client_name}</p>

      {/* Third row: Project type icon + label | City */}
      <div className="flex items-center gap-4 text-sm text-[#6B7280] mb-3">
        <div className="flex items-center gap-1">
          {typeIcon}
          <span>{projectType?.label || project.project_type}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{project.city}</span>
        </div>
      </div>

      {/* Fourth row: Phase progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
          <span>Phase Progress</span>
          <span>{completedCount}/{totalPhases} phases</span>
        </div>
        <PhaseProgressBar phases={phases} totalPhases={totalPhases} />
      </div>

      {/* Bottom row: Start date | Days remaining/overdue */}
      <div className="flex items-center justify-between text-xs text-[#6B7280]">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Started {formatDate(project.start_date || '')}</span>
        </div>
        <span className={cn(isOverdue ? 'text-[#C62828] font-medium' : '')}>
          {isOverdue ? `${days} days overdue` : `${days} days remaining`}
        </span>

      </div>
    </Card>
  );
}

function PhaseProgressBar({ phases, totalPhases }: { phases: IProjectPhase[]; totalPhases: number }) {
  const getSegmentColor = (status: PhaseStatus): string => {
    switch (status) {
      case 'completed': return 'bg-[#2E7D32]';
      case 'in_progress': return 'bg-[#1E88E5]';
      case 'blocked': return 'bg-[#C62828]';
      default: return 'bg-gray-200';
    }
  };

  if (phases.length === 0) {
    // Show 10 gray segments for empty phases
    return (
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex-1 bg-gray-200 rounded-full" />
        ))}
      </div>
    );
  }

  // Sort by phase number and create segments
  const sortedPhases = [...phases].sort((a, b) => (a.phase_order ?? 0) - (b.phase_order ?? 0));


  return (
    <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-gray-100">
      {sortedPhases.map((phase) => (
        <div
          key={phase.id}
          className={cn('flex-1 transition-colors', getSegmentColor(phase.status as any))}

        />
      ))}
    </div>
  );
}

function getProjectTypeIcon(type: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    boardroom: <span className="text-base">🖥️</span>,
    conference_room: <span className="text-base">📹</span>,
    residential_hni: <span className="text-base">🏠</span>,
    experience_centre: <span className="text-base">✨</span>,
    auditorium: <span className="text-base">🏛️</span>,
    lighting_hvac: <span className="text-base">💡</span>,
  };
  return icons[type] || <span className="text-base">📁</span>;
}
