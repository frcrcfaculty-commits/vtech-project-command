import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useMilestones } from '@/hooks/useMilestones';
import { useAuth } from '@/contexts/AuthContext';

import { MilestoneForm } from './MilestoneForm';
import { TaskList } from '@/components/tasks/TaskList';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { cn, getStatusColor } from '@/lib/utils';
import type { IMilestone } from '@/lib/types';

interface MilestoneListProps {
  phaseId: string;
  projectId: string;
}

export function MilestoneList({ phaseId, projectId }: MilestoneListProps) {
  const { milestones, loading, error, fetchByPhase, deleteMilestone } = useMilestones();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<IMilestone | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchByPhase(phaseId);
  }, [phaseId, fetchByPhase]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const canAdd = user?.role === 'owner' || user?.role === 'team_lead';

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this milestone and all its tasks?`)) return;
    await deleteMilestone(id);
    setConfirmDelete(null);
    fetchByPhase(phaseId);
  };

  const progress = (m: IMilestone) => {
    const total = m.task_count ?? 0;
    if (total === 0) return 0;
    return Math.round(((m.tasks_done ?? 0) / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-danger">Failed to load milestones</p>;
  }

  if (milestones.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-gray-500">No milestones in this phase yet. Add one to get started.</p>
        {canAdd && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 text-sm text-secondary hover:underline"
          >
            + Add Milestone
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {milestones.map((m) => {
        const isOpen = expanded[m.id];
        return (
          <div key={m.id} className="border border-gray-100 rounded-[8px] overflow-hidden bg-white">
            {/* Header */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(m.id)}
            >
              <button className="text-gray-500 touch-target">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <span className="flex-1 text-sm font-semibold text-gray-900">{m.title}</span>
              <span className="text-xs text-gray-500">{formatDate(m.due_date || '')}</span>
              <Badge
                status={m.status === 'completed' ? 'completed' : 'active'}
                label={m.status}
              />


            </div>

            {/* Progress bar */}
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${progress(m)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {m.tasks_done ?? 0}/{m.task_count ?? 0}
                </span>
              </div>
            </div>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-gray-100 px-3 py-3">
                <div className="flex justify-end gap-1 mb-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingMilestone(m); setShowForm(true); }}
                    className="px-2 py-1 text-xs text-secondary hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                    className="px-2 py-1 text-xs text-danger hover:bg-red-50 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <TaskList
                  milestoneId={m.id}
                  phaseId={phaseId}
                  projectId={projectId}
                />
              </div>
            )}
          </div>
        );
      })}

      {canAdd && (
        <button
          onClick={() => { setEditingMilestone(undefined); setShowForm(true); }}
          className="flex items-center justify-center gap-1 py-2 text-sm text-secondary border border-dashed border-secondary rounded-[8px] hover:bg-blue-50 touch-target"
        >
          <Plus size={14} /> Add Milestone
        </button>
      )}

      <MilestoneForm
        open={showForm}


        onClose={() => { setShowForm(false); setEditingMilestone(undefined); }}
        onSaved={() => fetchByPhase(phaseId)}
        phaseId={phaseId}
        projectId={projectId}
        milestone={editingMilestone}
      />
    </div>
  );
}
