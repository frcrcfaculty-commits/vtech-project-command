import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { IMilestone, MilestoneStatus } from '@/lib/types';

interface CreateMilestoneData {
  phase_id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  created_by: string;
}

interface UpdateMilestoneData {
  title?: string;
  description?: string;
  due_date?: string;
  status?: MilestoneStatus;
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
          tasks(id, status)
        `)
        .eq('phase_id', phaseId)
        .order('due_date', { ascending: true });

      if (err) throw err;
      setMilestones((data ?? []) as IMilestone[]);
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
          tasks(id, status)
        `)
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (err) throw err;
      setMilestones((data ?? []) as IMilestone[]);
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
        created_by: data.created_by,
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
