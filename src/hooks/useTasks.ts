import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ITask } from '@/lib/types';

interface CreateTaskData {
  milestone_id: string;
  phase_id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_by: string;
  priority: string;
  due_date?: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  due_date?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByMilestone = useCallback(async (milestoneId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:assigned_to(full_name, avatar_url),
          assigner_user:assigned_by(full_name)
        `)
        .eq('milestone_id', milestoneId)
        .order('priority', { ascending: false });

      if (err) throw err;

      const mapped: ITask[] = (data ?? []).map((t: Record<string, unknown>) => ({
        ...(t as Omit<ITask, 'assignee_name' | 'assignee_avatar' | 'assigner_name'>),
        assignee_name: (t.assigned_user as { full_name: string } | null)?.full_name,
        assignee_avatar: (t.assigned_user as { avatar_url: string } | null)?.avatar_url,
        assigner_name: (t.assigner_user as { full_name: string } | null)?.full_name,
      }));

      setTasks(mapped);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(name),
          project_phases(phase_name),
          assigned_user:assigned_to(full_name, avatar_url),
          assigner_user:assigned_by(full_name)
        `)
        .eq('assigned_to', userId)
        .neq('status', 'done')
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });

      if (err) throw err;

      const mapped: ITask[] = (data ?? []).map((t: Record<string, unknown>) => ({
        ...(t as Omit<ITask, 'project_name' | 'phase_name' | 'assignee_name' | 'assignee_avatar' | 'assigner_name'>),
        project_name: (t.projects as { name: string } | null)?.name,
        phase_name: (t.project_phases as { phase_name: string } | null)?.phase_name,
        assignee_name: (t.assigned_user as { full_name: string } | null)?.full_name,
        assignee_avatar: (t.assigned_user as { avatar_url: string } | null)?.avatar_url,
        assigner_name: (t.assigner_user as { full_name: string } | null)?.full_name,
      }));

      setTasks(mapped);
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
        .from('tasks')
        .select(`
          *,
          projects(name),
          project_phases(phase_name),
          milestones(title),
          assigned_user:assigned_to(full_name, avatar_url)
        `)
        .eq('project_id', projectId);

      if (err) throw err;

      const mapped: ITask[] = (data ?? []).map((t: Record<string, unknown>) => ({
        ...(t as Omit<ITask, 'project_name' | 'phase_name' | 'milestone_title' | 'assignee_name' | 'assignee_avatar'>),
        project_name: (t.projects as { name: string } | null)?.name,
        phase_name: (t.project_phases as { phase_name: string } | null)?.phase_name,
        milestone_title: (t.milestones as { title: string } | null)?.title,
        assignee_name: (t.assigned_user as { full_name: string } | null)?.full_name,
        assignee_avatar: (t.assigned_user as { avatar_url: string } | null)?.avatar_url,
      }));

      setTasks(mapped);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByTeam = useCallback(async (teamId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(name),
          project_phases(phase_name),
          assigned_user:assigned_to(full_name, avatar_url, team_id)
        `)
        .eq('assigned_user.team_id', teamId);

      if (err) throw err;

      const mapped: ITask[] = (data ?? []).map((t: Record<string, unknown>) => ({
        ...(t as Omit<ITask, 'project_name' | 'phase_name' | 'assignee_name' | 'assignee_avatar'>),
        project_name: (t.projects as { name: string } | null)?.name,
        phase_name: (t.project_phases as { phase_name: string } | null)?.phase_name,
        assignee_name: (t.assigned_user as { full_name: string } | null)?.full_name,
        assignee_avatar: (t.assigned_user as { avatar_url: string } | null)?.avatar_url,
      }));

      setTasks(mapped);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: CreateTaskData) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.from('tasks').insert({
        milestone_id: data.milestone_id,
        phase_id: data.phase_id,
        project_id: data.project_id,
        title: data.title,
        description: data.description ?? null,
        assigned_to: data.assigned_to,
        assigned_by: data.assigned_by,
        priority: data.priority,
        due_date: data.due_date ?? null,
        status: 'todo',
      });
      if (err) throw err;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: UpdateTaskData) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('tasks')
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

  const assignTask = useCallback(async (taskId: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('tasks')
        .update({ assigned_to: userId })
        .eq('id', taskId);
      if (err) throw err;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchByMilestone,
    fetchByUser,
    fetchByProject,
    fetchByTeam,
    createTask,
    updateTask,
    assignTask,
  };
}
