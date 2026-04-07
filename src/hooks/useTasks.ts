import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ITask, TaskStatus, TaskPriority } from '@/lib/types';

interface CreateTaskData {
  milestone_id: string;
  phase_id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_by: string;
  priority: TaskPriority;
  due_date?: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
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
          assignee:assigned_to(id, full_name, avatar_url)
        `)
        .eq('milestone_id', milestoneId)
        .order('priority', { ascending: false });

      if (err) throw err;
      setTasks((data ?? []) as ITask[]);
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
          assignee:assigned_to(id, full_name, avatar_url)
        `)
        .eq('assigned_to', userId)
        .neq('status', 'done')
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });

      if (err) throw err;
      setTasks((data ?? []) as ITask[]);
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
          assignee:assigned_to(id, full_name, avatar_url)
        `)
        .eq('project_id', projectId);

      if (err) throw err;
      setTasks((data ?? []) as ITask[]);
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
          assignee:assigned_to!inner(id, full_name, avatar_url, team_id)
        `)
        .eq('assignee.team_id', teamId);

      if (err) throw err;
      setTasks((data ?? []) as ITask[]);
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
