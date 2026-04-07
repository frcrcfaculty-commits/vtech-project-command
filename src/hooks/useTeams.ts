import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { IUser, ITeam } from '@/lib/types';
import { TEAMS } from '@/lib/constants';

export function useTeams() {
  const [teams, setTeams] = useState<ITeam[]>(TEAMS as unknown as ITeam[]);
  const [members, setMembers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (teamId?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('users').select('*').order('name');
      if (teamId) query = query.eq('team_id', teamId);
      const { data, error: err } = await query;
      if (err) throw err;
      setMembers(data ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .order('name');
      if (err) throw err;
      setMembers(data ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(async (member: Omit<IUser, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      // Create auth user
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: member.email,
        password: 'Welcome@123',
        email_confirm: true,
      });
      if (authErr) throw authErr;
      const userId = authData.user.id;

      // Insert profile
      const { error: insertErr } = await supabase.from('users').insert({
        id: userId,
        full_name: member.full_name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        team_id: member.team_id,
        is_active: true,
      });
      if (insertErr) throw insertErr;
      await fetchAllMembers();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchAllMembers]);

  const updateMember = useCallback(async (id: string, updates: Partial<IUser>) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (err) throw err;
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    await updateMember(id, { is_active: isActive });
  }, [updateMember]);

  return { teams, members, loading, error, fetchMembers, fetchAllMembers, addMember, updateMember, toggleActive };
}
