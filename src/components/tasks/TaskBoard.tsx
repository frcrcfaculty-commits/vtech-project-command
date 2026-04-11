import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { cn, getPriorityColor, formatDate, isOverdue } from '@/lib/utils';
import { TASK_STATUSES, TASK_PRIORITIES, PROJECT_TYPES } from '@/lib/constants';
import type { ITask } from '@/lib/types';

interface TaskBoardProps {
  teamId: string;
  projects?: Array<{ id: string; name: string }>;
  teamMembers?: Array<{ id: string; full_name: string }>;
}

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
  { key: 'blocked', label: 'Blocked' },
];

export function TaskBoard({ teamId, projects = [], teamMembers = [] }: TaskBoardProps) {
  const { tasks, loading, fetchByTeam, updateTask } = useTasks();
  const [filterProject, setFilterProject] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    fetchByTeam(teamId);
  }, [teamId, fetchByTeam]);

  const filtered = tasks.filter((t) => {
    if (filterProject && t.project_id !== filterProject) return false;
    if (filterMember && t.assigned_to !== filterMember) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const byStatus = (status: string) =>
    filtered.filter((t) => t.status === status);

  if (loading) {
    return <div className="text-sm text-white/50">Loading board...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          value={filterProject}
          onChange={(val: string) => setFilterProject(val)}

          placeholder="All Projects"
        />
        <Select
          options={teamMembers.map((m) => ({ value: m.id, label: m.full_name }))}
          value={filterMember}
          onChange={(val: string) => setFilterMember(val)}

          placeholder="All Members"
        />
        <Select
          options={[...TASK_PRIORITIES]}
          value={filterPriority}
          onChange={(val: string) => setFilterPriority(val)}

          placeholder="All Priorities"
        />
        {(filterProject || filterMember || filterPriority) && (
          <button
            onClick={() => { setFilterProject(''); setFilterMember(''); setFilterPriority(''); }}
            className="px-3 py-2 text-xs text-white/50 hover:text-white/90"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Board — horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {COLUMNS.map((col) => {
          const colTasks = byStatus(col.key);
          return (
            <div key={col.key} className="flex-shrink-0 w-64">
              {/* Column header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-sm font-semibold text-white/90">{col.label}</span>
                <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-white/8 text-white/50 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {colTasks.map((task) => {
                  const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'done';
                  return (
                    <div
                      key={task.id}
                      className="bg-white/5 border border-white/8 rounded-[8px] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    >
                      <p className="text-sm font-medium text-white/90 mb-1">{task.title}</p>
                      {task.project_name && (
                        <p className="text-xs text-white/50 mb-1.5">{task.project_name}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {task.assignee_name && (
                            <span className="text-xs text-white/50">{task.assignee_name}</span>
                          )}
                          <Badge
                            status={task.priority === 'high' ? 'cancelled' : task.priority === 'medium' ? 'on_hold' : 'completed'}
                            label={task.priority as string}
                            className="text-[10px] px-1.5 py-0"
                          />

                        </div>
                        {task.due_date && (
                          <span className={cn('text-xs', overdue ? 'text-danger' : 'text-white/50')}>
                            {formatDate(task.due_date)}
                          </span>
                        )}
                      </div>
                      {/* Status change dropdown */}
                      <div className="mt-2 pt-2 border-t border-white/8">
                        <select
                          value={task.status}
                          onChange={async (e) => {
                            await updateTask(task.id, { status: e.target.value });
                            fetchByTeam(teamId);
                          }}
                          className="w-full text-xs border border-white/10 rounded px-2 py-1 bg-white/5"
                        >
                          {TASK_STATUSES.map((s: any) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}

                        </select>
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="text-center py-4 text-xs text-white/50 border border-dashed border-white/10 rounded-[8px]">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
