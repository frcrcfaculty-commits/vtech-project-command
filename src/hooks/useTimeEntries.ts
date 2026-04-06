import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ITimeEntry } from '@/lib/types';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export function useTimeEntries() {
  const [entries, setEntries] = useState<ITimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = useCallback(async (userId: string) => {
    setLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('time_entries')
      .select('*, projects(name), project_phases(phase_name), tasks(title)')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setEntries(data as any);
    setLoading(false);
  }, []);

  const fetchByDateRange = useCallback(async (userId: string, startDate: string, endDate: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('time_entries')
      .select('*, projects(name), project_phases(phase_name), tasks(title)')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: false });

    if (error) setError(error.message);
    else setEntries(data as any);
    setLoading(false);
  }, []);

  const fetchByProject = useCallback(async (projectId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('time_entries')
      .select('*, users(full_name, team_id)')
      .eq('project_id', projectId)
      .order('entry_date', { ascending: false });

    if (error) setError(error.message);
    else setEntries(data as any);
    setLoading(false);
  }, []);

  const fetchByTeam = useCallback(async (teamId: string, startDate: string, endDate: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('time_entries')
      .select('*, users!inner(full_name, team_id), projects(name)')
      .eq('users.team_id', teamId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: false });

    if (error) setError(error.message);
    else setEntries(data as any);
    setLoading(false);
  }, []);

  const fetchUnverified = useCallback(async (teamId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('time_entries')
      .select('*, users!inner(full_name, team_id), projects(name)')
      .eq('users.team_id', teamId)
      .is('verified_by', null)
      .order('entry_date', { ascending: false });

    if (error) setError(error.message);
    else setEntries(data as any);
    setLoading(false);
  }, []);

  const getDailyTotal = async (userId: string, date: string): Promise<number> => {
    const { data, error } = await supabase
      .from('time_entries')
      .select('work_hours, travel_hours')
      .eq('user_id', userId)
      .eq('entry_date', date);

    if (error) return 0;
    return data.reduce((sum, entry) => sum + Number(entry.work_hours) + Number(entry.travel_hours), 0);
  };

  const createEntry = async (data: Partial<ITimeEntry>) => {
    setLoading(true);
    setError(null);

    // Validation: Max daily hours
    const currentTotal = await getDailyTotal(data.user_id!, data.entry_date!);
    const newTotal = currentTotal + Number(data.work_hours || 0) + Number(data.travel_hours || 0);
    
    if (newTotal > 16) {
      setError("Total hours per day cannot exceed 16.");
      setLoading(false);
      return { error: "Max hours exceeded" };
    }

    const { data: result, error } = await supabase
      .from('time_entries')
      .insert(data)
      .select()
      .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return { error };
    }
    return { data: result };
  };

  const updateEntry = async (id: string, data: Partial<ITimeEntry>) => {
    setLoading(true);
    // Check if verified
    const { data: existing } = await supabase.from('time_entries').select('verified_by').eq('id', id).single();
    if (existing?.verified_by) {
      setError("Cannot edit a verified entry.");
      setLoading(false);
      return { error: "Verified" };
    }

    const { data: result, error } = await supabase
      .from('time_entries')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    setLoading(false);
    if (error) setError(error.message);
    return { data: result, error };
  };

  const deleteEntry = async (id: string) => {
    setLoading(true);
    const { data: existing } = await supabase.from('time_entries').select('verified_by').eq('id', id).single();
    if (existing?.verified_by) {
      setError("Cannot delete a verified entry.");
      setLoading(false);
      return { error: "Verified" };
    }

    const { error } = await supabase.from('time_entries').delete().eq('id', id);
    setLoading(false);
    if (error) setError(error.message);
    return { error };
  };

  const verifyEntry = async (id: string, verifiedByUserId: string) => {
    const { error } = await supabase
      .from('time_entries')
      .update({ verified_by: verifiedByUserId, verified_at: new Date().toISOString() })
      .eq('id', id);
    return { error };
  };

  const bulkVerify = async (ids: string[], verifiedByUserId: string) => {
    const { error } = await supabase
      .from('time_entries')
      .update({ verified_by: verifiedByUserId, verified_at: new Date().toISOString() })
      .in('id', ids);
    return { error };
  };

  const copyYesterday = async (userId: string) => {
    setLoading(true);
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');

    const { data: lastEntries, error: fetchError } = await supabase
      .from('time_entries')
      .select('project_id, phase_id, task_id, work_hours, travel_hours, city, notes')
      .eq('user_id', userId)
      .eq('entry_date', yesterday);

    if (fetchError || !lastEntries || lastEntries.length === 0) {
      setLoading(false);
      return { error: fetchError?.message || "No entries found for yesterday" };
    }

    const newEntries = lastEntries.map(entry => ({
      ...entry,
      user_id: userId,
      entry_date: today,
    }));

    const { data, error } = await supabase.from('time_entries').insert(newEntries).select();
    setLoading(false);
    return { data, error };
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, client_name, status')
      .in('status', ['active', 'planning'])
      .order('name');
    return { data, error };
  };

  const fetchPhases = async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_phases')
      .select('id, phase_name, status')
      .eq('project_id', projectId)
      .order('phase_order');
    return { data, error };
  };

  const fetchTasks = async (phaseId: string, userId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status')
      .eq('phase_id', phaseId)
      .eq('assigned_to', userId)
      .neq('status', 'done')
      .order('priority', { ascending: false });
    return { data, error };
  };

  return {
    entries,
    loading,
    error,
    fetchToday,
    fetchByDateRange,
    fetchByProject,
    fetchByTeam,
    fetchUnverified,
    createEntry,
    updateEntry,
    deleteEntry,
    verifyEntry,
    bulkVerify,
    copyYesterday,
    getDailyTotal,
    fetchProjects,
    fetchPhases,
    fetchTasks
  };
}
