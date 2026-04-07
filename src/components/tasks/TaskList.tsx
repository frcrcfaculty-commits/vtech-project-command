import { useState, useEffect, useCallback } from 'react';
import { Circle, CheckCircle2, AlertCircle, Clock, Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';

import { TaskForm } from './TaskForm';
import { Badge } from '@/components/ui/Badge';
import { cn, isOverdue, getPriorityColor } from '@/lib/utils';
import { TASK_STATUSES } from '@/lib/constants';
import type { ITask } from '@/lib/types';

interface TaskListProps {
  milestoneId: string;
  phaseId: string;
  projectId: string;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  todo: <Circle size={16} className="text-gray-400" />,
  in_progress: <Clock size={16} className="text-[#1E88E5]" />,
  done: <CheckCircle2 size={16} className="text-[#2E7D32]" />,
  blocked: <AlertCircle size={16} className="text-[#C62828]" />,
};

export function TaskList({ milestoneId, phaseId, projectId }: TaskListProps) {
  const { tasks, loading, fetchByMilestone, updateTask } = useTasks();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | undefined>();
  const [flashTask, setFlashTask] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchByMilestone(milestoneId);
  }, [milestoneId, fetchByMilestone]);

  const cycleStatus = useCallback(async (task: ITask) => {
    const order = ['todo', 'in_progress', 'done', 'blocked'];
    const idx = order.indexOf(task.status);
    const next = order[(idx + 1) % order.length];
    await updateTask(task.id, { status: next });
    if (next === 'done') {
      setFlashTask(task.id);
      setTimeout(() => setFlashTask(null), 600);
    }
    fetchByMilestone(milestoneId);
  }, [milestoneId, updateTask, fetchByMilestone]);

  const canAdd = user?.role === 'owner' || user?.role === 'team_lead';

  if (loading) {
    return <div className="py-2 text-sm text-[#6B7280]">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-3">
        <p className="text-xs text-[#6B7280]">No tasks yet. Break this milestone into actionable tasks.</p>
        {canAdd && (
          <button
            onClick={() => { setEditingTask(undefined); setShowForm(true); }}
            className="mt-1 text-xs text-[#1E88E5] hover:underline"
          >
            + Add Task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {tasks.map((task) => {
        const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'done';
        return (
          <div
            key={task.id}
            className={cn(
              'flex items-center gap-2 px-2 py-2 rounded-[6px] bg-gray-50 border border-gray-100 transition-colors',
              flashTask === task.id && 'bg-green-50 border-green-200'
            )}
          >
            {/* Status icon */}
            <button
              onClick={() => cycleStatus(task)}
              className="flex-shrink-0 touch-target"
              aria-label={`Status: ${task.status}`}
            >
              {STATUS_ICONS[task.status]}
            </button>

            {/* Middle: title + assignee + priority */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1A2E] truncate">{task.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {task.assignee_name && (
                  <span className="text-xs text-[#6B7280]">{task.assignee_name}</span>
                )}
                <Badge
                  status={task.priority === 'high' ? 'cancelled' : task.priority === 'medium' ? 'on_hold' : 'completed'}
                  label={task.priority as string}
                  className="text-[10px] px-1.5 py-0"
                />

              </div>
            </div>

            {/* Right: due date + status toggle */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {task.due_date && (
                <span className={cn('text-xs', overdue ? 'text-[#C62828] font-medium' : 'text-[#6B7280]')}>
                  {new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              )}
              <div className="relative">
                <button
                  onClick={() => setStatusOpen(statusOpen === task.id ? null : task.id)}
                  className="px-1.5 py-0.5 text-xs border border-gray-200 rounded hover:bg-gray-100"
                >
                  {task.status.replace('_', ' ')}
                </button>
                {statusOpen === task.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-[6px] shadow-md z-10 min-w-[100px]">
                    {TASK_STATUSES.map((s: any) => (
                      <button
                        key={s.value}
                        onClick={async () => {
                          await updateTask(task.id, { status: s.value });
                          setStatusOpen(null);
                          fetchByMilestone(milestoneId);
                        }}
                        className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                      >
                        {s.label}
                      </button>
                    ))}

                  </div>
                )}
              </div>
              <button
                onClick={() => { setEditingTask(task); setShowForm(true); }}
                className="px-1.5 py-0.5 text-xs text-[#1E88E5] border border-gray-200 rounded hover:bg-blue-50"
              >
                Edit
              </button>
            </div>
          </div>
        );
      })}

      {canAdd && (
        <button
          onClick={() => { setEditingTask(undefined); setShowForm(true); }}
          className="flex items-center justify-center gap-1 py-1.5 text-xs text-[#1E88E5] border border-dashed border-[#1E88E5] rounded-[6px] hover:bg-blue-50"
        >
          <Plus size={12} /> Add Task
        </button>
      )}

      <TaskForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingTask(undefined); }}
        onSaved={() => fetchByMilestone(milestoneId)}
        milestoneId={milestoneId}
        phaseId={phaseId}
        projectId={projectId}
        task={editingTask}
        currentUserId={user?.id}
      />
    </div>
  );
}
