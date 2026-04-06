import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { IMilestone } from '@/lib/types';

interface CreateMilestoneData {
  phase_id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
}

interface UpdateMilestoneData {
  title?: string;
  description?: string;
  due_date?: string;
  status?: string;
}

export function useMilestones() {
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByPhase = useCallback(async (phaseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('milestones')
        .select(`
          *,
          tasks(count, status)
        `)
        .eq('phase_id', phaseId)
        .order('due_date', { ascending: true });

      if (err) throw err;

      const mapped: IMilestone[] = (data ?? []).map((m: Record<string, unknown>) => {
        const tasks = m.tasks as Array<{ count: number; status: string }>;
        const total = tasks?.reduce((sum: number, t: { count: number }) => sum + (t.count ?? 0), 0) ?? 0;
        const done = tasks?.filter((t: { status: string }) => t.status === 'done').length ?? 0;
        return {
          ...(m as Omit<IMilestone, 'task_count' | 'tasks_done'>),
          task_count: total,
          tasks_done: done,
        };
      });

      setMilestones(mapped);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('milestones')
        .select(`
          *,
          project_phases(phase_name),
          tasks(count, status)
        `)
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (err) throw err;

      const mapped: IMilestone[] = (data ?? []).map((m: Record<string, unknown>) => {
        const phases = m.project_phases as { phase_name: string };
        const tasks = m.tasks as Array<{ count: number; status: string }>;
        const total = tasks?.reduce((sum: number, t: { count: number }) => sum + (t.count ?? 0), 0) ?? 0;
        const done = tasks?.filter((t: { status: string }) => t.status === 'done').length ?? 0;
        return {
          ...(m as Omit<IMilestone, 'phase_name' | 'task_count' | 'tasks_done'>),
          phase_name: phases?.phase_name,
          task_count: total,
          tasks_done: done,
        };
      });

      setMilestones(mapped);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMilestone = useCallback(async (data: CreateMilestoneData) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.from('milestones').insert({
        phase_id: data.phase_id,
        project_id: data.project_id,
        title: data.title,
        description: data.description ?? null,
        due_date: data.due_date,
        status: 'pending',
      });
      if (err) throw err;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMilestone = useCallback(async (id: string, data: UpdateMilestoneData) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('milestones')
        .update(data)
        .eq('id', id);
      if (err) throw err;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMilestone = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.from('milestones').delete().eq('id', id);
      if (err) throw err;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    milestones,
    loading,
    error,
    fetchByPhase,
    fetchByProject,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
