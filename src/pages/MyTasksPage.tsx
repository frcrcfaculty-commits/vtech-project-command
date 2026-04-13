import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { cn, isOverdue, formatRelativeDate, getPriorityColor } from '@/lib/utils';
import { TASK_PRIORITIES } from '@/lib/constants';
import type { ITask } from '@/lib/types';

export function MyTasksPage() {
  const { user } = useAuth();
  const { tasks, loading, fetchByUser, updateTask } = useTasks();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    await fetchByUser(user.id);
  }, [user?.id, fetchByUser]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const overdue = tasks.filter(
    (t) => t.due_date && t.due_date < todayStr && t.status !== 'done'
  );
  const today = tasks.filter(
    (t) => (t.due_date === todayStr || t.status === 'in_progress') && t.status !== 'done'
  );
  const upcoming = tasks.filter(
    (t) =>
      t.due_date &&
      t.due_date >= todayStr &&
      t.due_date <= weekFromNow &&
      t.status === 'todo'
  );

  const cycleStatus = async (task: ITask) => {
    const order = ['todo', 'in_progress', 'done'];
    const idx = order.indexOf(task.status);
    if (idx === -1 || idx === order.length - 1) return;
    const next = order[idx + 1];
    await updateTask(task.id, { status: next });
    await load();
  };

  if (!user) return null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-primary">My Tasks</h1>
        <p className="text-sm text-white/70 mt-0.5">Your assigned work at a glance</p>
      </header>

      {loading && tasks.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 size={48} className="mx-auto text-white/30 mb-3" />
          <p className="text-sm font-medium text-white/90">No tasks assigned to you</p>
          <p className="text-xs text-white/70 mt-1">Check with your team lead.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Overdue */}
          {overdue.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-danger mb-3">
                <AlertTriangle size={14} /> Overdue ({overdue.length})
              </h2>
              <div className="flex flex-col gap-2">
                {overdue.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    borderColor="border-l-[#C62828]"
                    onStatusCycle={() => cycleStatus(task)}
                    onLogTime={() => navigate(`/time?project=${task.project_id}&phase=${task.phase_id}&task=${task.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Today */}
          {today.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-secondary mb-3">
                <Clock size={14} /> Today ({today.length})
              </h2>
              <div className="flex flex-col gap-2">
                {today.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    borderColor="border-l-[#DA2E8F]"
                    onStatusCycle={() => cycleStatus(task)}
                    onLogTime={() => navigate(`/time?project=${task.project_id}&phase=${task.phase_id}&task=${task.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="flex flex-col gap-2">
                {([...upcoming].sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? '')))
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      borderColor="border-l-gray-300"
                      onStatusCycle={() => cycleStatus(task)}
                      onLogTime={() => navigate(`/time?project=${task.project_id}&phase=${task.phase_id}&task=${task.id}`)}
                    />
                  ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Pull to refresh */}
      <div className="text-center mt-8 mb-4">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="min-h-[44px] px-6 py-2.5 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/5 active:bg-white/8 disabled:opacity-50 transition-colors"
        >
          {refreshing ? 'Refreshing...' : '↻ Tap to refresh'}
        </button>
      </div>
    </main>
  );
}

interface TaskCardProps {
  task: ITask;
  borderColor: string;
  onStatusCycle: () => void;
  onLogTime: () => void;
}

function TaskCard({ task, borderColor, onStatusCycle, onLogTime }: TaskCardProps) {
  const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'done';
  const statusColors: Record<string, string> = {
    todo: 'bg-white/8 text-white/70',
    in_progress: 'bg-blue-500/10 text-secondary',
    done: 'bg-green-500/10 text-success',
    blocked: 'bg-red-500/10 text-danger',
  };

  return (
    <Card className={cn('border-l-4 pl-3 pr-4 py-3', borderColor)}>
      {/* Project + Phase */}
      <div className="flex items-center gap-2 mb-1">
        {task.project_name && (
          <span className="text-xs text-white/70">{task.project_name}</span>
        )}
        {task.phase_name && (
          <Badge className="text-[10px] px-1.5 py-0 bg-white/8 text-white/70">
            {task.phase_name}
          </Badge>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-white/90 mb-1">{task.title}</p>

      {/* Assigned by */}
      {task.assigned_by && (
        <p className="text-xs text-white/70 mb-2">Assigned by {task.assigned_by}</p>
      )}

      {/* Priority + Due date row */}
      <div className="flex items-center justify-between">
        <Badge
          status={task.priority === 'high' ? 'cancelled' : task.priority === 'medium' ? 'on_hold' : 'completed'}
          label={task.priority as string}
          className="text-[10px] px-1.5 py-0"
        />

        {task.due_date && (
          <span className={cn('text-xs font-medium', overdue ? 'text-danger' : 'text-white/70')}>
            {formatRelativeDate(task.due_date)}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onStatusCycle}
          className={cn(
            'flex-1 min-h-[44px] py-2.5 rounded-lg text-sm font-medium transition-colors',
            task.status === 'done'
              ? 'bg-white/8 text-white/70'
              : 'bg-success text-white hover:bg-[#256427] active:bg-[#1b4e1d]'
          )}
        >
          {task.status === 'done' ? 'Completed' : 'Mark Done'}
        </button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onLogTime}
          className="flex-1 min-h-[44px] text-sm"
        >
          Log Time
        </Button>
        <button
          onClick={onLogTime}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white/70 hover:text-white/90 active:bg-white/8 rounded-lg transition-colors"
          aria-label="More options"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </Card>
  );
}
