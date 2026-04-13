import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { ITask } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { CheckSquare, Clock, Users, AlertCircle, Plus, Save, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface DailyActivity {
  id?: string;
  user_id: string;
  date: string;
  activities: string;
  blockers: string;
  depends_on_team_id: string | null;
  depends_on_task_id: string | null;
  created_at?: string;
}

export function SummaryPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<DailyActivity>({
    user_id: user?.id || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    activities: '',
    blockers: '',
    depends_on_team_id: null,
    depends_on_task_id: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchTodaysTasks();
    fetchDailyActivity();
  }, [user?.id]);

  const fetchTodaysTasks = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('tasks')
        .select('*, project:projects(id, name), milestone:milestones(id, title), assignee:users(full_name, avatar_url)')
        .eq('assigned_to', user.id)
        .or(`due_date.eq.${today},due_date.lt.${today}`)
        .order('priority', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyActivity = async () => {
    if (!user?.id) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      const { data } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();
      if (data) setActivity(data);
    } catch {
      // No activity for today yet
    }
  };

  const saveActivity = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('daily_activities')
        .upsert({
          user_id: user.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          activities: activity.activities,
          blockers: activity.blockers,
          depends_on_team_id: activity.depends_on_team_id,
          depends_on_task_id: activity.depends_on_task_id,
        }, { onConflict: 'user_id,date' });

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save activity error:', err);
    } finally {
      setSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400';
      case 'blocked': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-white/40';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Today's Summary</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Tasks Due Today */}
      <Card header={
        <div className="flex items-center justify-between">
          <span className="font-semibold">Tasks Due Today</span>
          <Badge status="in_progress" label={`${tasks.length} tasks`} />
        </div>
      }>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-secondary)]">
            <CheckSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p>No tasks due today. Great job!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-green-400' : task.status === 'in_progress' ? 'bg-purple-400' : 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{task.title}</p>
                  {task.project_name && (
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">{task.project_name}</p>
                  )}
                </div>
                <Badge className={getPriorityColor(task.priority)} label={task.priority} />
                <Badge className={getStatusColor(task.status)} label={task.status.replace('_', ' ')} />
                <ChevronRight size={16} className="text-[var(--color-text-tertiary)]" />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Daily Activity Notes */}
      <Card header={
        <div className="flex items-center justify-between">
          <span className="font-semibold">Today's Activities</span>
          {saved && (
            <Badge className="bg-green-500/20 text-green-400" label="Saved!" />
          )}
        </div>
      }>
        <div className="space-y-4">
          <Textarea
            label="What did you accomplish today?"
            placeholder="List your activities, progress made..."
            value={activity.activities}
            onChange={(e) => setActivity({ ...activity, activities: e.target.value })}
            rows={4}
          />
          <Textarea
            label="Any blockers or challenges?"
            placeholder="Describe any issues preventing progress..."
            value={activity.blockers}
            onChange={(e) => setActivity({ ...activity, blockers: e.target.value })}
            rows={3}
          />
          <Button
            variant="primary"
            onClick={saveActivity}
            loading={saving}
            icon={<Save size={16} />}
          >
            Save Summary
          </Button>
        </div>
      </Card>

      {/* Dependencies Section */}
      <Card header={
        <div className="flex items-center justify-between">
          <span className="font-semibold">Dependencies</span>
          <Badge className="bg-yellow-500/20 text-yellow-400" label="Flag issues" />
        </div>
      }>
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Stuck on a task? Tag other teams or team members whose pending work is blocking you.
          </p>
          <Input
            label="Depends on Team"
            placeholder="Select team (optional)"
            value={activity.depends_on_team_id || ''}
            onChange={(e) => setActivity({ ...activity, depends_on_team_id: e.target.value || null })}
          />
          <Input
            label="Depends on Task"
            placeholder="Reference specific task (optional)"
            value={activity.depends_on_task_id || ''}
            onChange={(e) => setActivity({ ...activity, depends_on_task_id: e.target.value || null })}
          />
        </div>
      </Card>
    </div>
  );
}

export default SummaryPage;