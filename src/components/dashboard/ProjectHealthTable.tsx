import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, MonitorPlay, Users, Home, Presentation, Mic, Lightbulb } from 'lucide-react';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PROJECT_TYPES, STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ProjectHealth {
  id: string;
  name: string;
  client: string;
  status: string;
  type: string;
  health: 'green' | 'yellow' | 'red';
  daysLeft: number;
  phase: string;
  hours: number;
}

type SortField = keyof ProjectHealth;
type SortDir = 'asc' | 'desc';

export function ProjectHealthTable() {
  const [sortField, setSortField] = useState<SortField>('daysLeft');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const { projectHealth, loading } = useDashboardCharts();

  if (loading) return <div className="bg-white/5 rounded-lg shadow-sm border border-white/8 p-4 h-full flex items-center justify-center"><Spinner /></div>;
  if (!projectHealth.length) return <div className="bg-white/5 rounded-lg shadow-sm border border-white/8 p-4 h-full"><EmptyState title="No projects" description="No project health data found" /></div>;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedData = [...projectHealth].sort((a: any, b: any) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return sortDir === 'asc' 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });


  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'boardroom': return <Presentation className="w-4 h-4 mr-2 text-white/50" />;
      case 'conference_room': return <Users className="w-4 h-4 mr-2 text-white/50" />;
      case 'residential': return <Home className="w-4 h-4 mr-2 text-white/50" />;
      case 'experience_centre': return <MonitorPlay className="w-4 h-4 mr-2 text-white/50" />;
      case 'auditorium': return <Mic className="w-4 h-4 mr-2 text-white/50" />;
      case 'lighting': return <Lightbulb className="w-4 h-4 mr-2 text-white/50" />;
      default: return null;
    }
  };

  const getHealthColor = (health: 'green' | 'yellow' | 'red') => {
    if (health === 'green') return 'bg-[var(--color-success,#2E7D32)]';
    if (health === 'yellow') return 'bg-[var(--color-warning,#F9A825)]';
    return 'bg-[var(--color-danger,#C62828)]';
  };


  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 ml-1 opacity-20" />;
    return sortDir === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 text-[var(--color-secondary,#DA2E8F)]" /> 
      : <ChevronDown className="w-4 h-4 ml-1 text-[var(--color-secondary,#DA2E8F)]" />;
  };

  return (
    <div className="bg-[var(--color-surface,#ffffff)] rounded-lg shadow-sm border border-white/8 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-white/8">
        <h3 className="text-lg font-semibold text-[var(--color-text,#1A1A2E)]">Project Health Summary</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm text-white/60">
          <thead className="bg-white/5 text-white/70 uppercase font-medium">
            <tr>
              {[
                { key: 'name', label: 'Project' },
                { key: 'client', label: 'Client' },
                { key: 'type', label: 'Type' },
                { key: 'status', label: 'Status' },
                { key: 'phase', label: 'Phase' },
                { key: 'daysLeft', label: 'Days Left' },
                { key: 'hours', label: 'Hours' },
                { key: 'health', label: 'Health' },
              ].map(({ key, label }) => (
                <th key={key} className="px-4 py-3 cursor-pointer hover:bg-white/8 transition-colors select-none" onClick={() => handleSort(key as SortField)}>
                  <div className="flex items-center">
                    {label}
                    <SortIcon field={key as SortField} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {sortedData.map((project: any) => (

              <tr key={project.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium text-[var(--color-primary,#723B8F)]">
                  <Link to={`/projects/${project.id}`} className="hover:text-[var(--color-secondary,#DA2E8F)] hover:underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{project.client}</td>
                <td className="px-4 py-3 flex items-center">
                  {getTypeIcon(project.type)}
                  {project.type}

                </td>
                <td className="px-4 py-3">
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{ 
                      backgroundColor: `${(STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] as any)?.bg || '#eee'}20`,
                      color: (STATUS_COLORS[project.status as keyof typeof STATUS_COLORS] as any)?.text || '#666'
                    }}

                  >
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/80">{project.phase}</td>
                <td className={cn(
                  "px-4 py-3 font-bold", 
                  project.daysLeft < 0 ? "text-[var(--color-danger,#C62828)]" : "text-white/80"
                )}>
                  {project.daysLeft}
                </td>
                <td className="px-4 py-3">{project.hours}h</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center w-full">
                    <div className={cn("w-3 h-3 rounded-full", getHealthColor(project.health))} title={String(project.health)} />
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
