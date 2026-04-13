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
      let query = supabase
        .from('users')
        .select('id, full_name, email, phone, role, team_id, avatar_url, is_active, created_at')
        .order('full_name');
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
      // FIX: Explicit column list — avoids any ambiguous column resolution.
      // The old select('*') was fine on its own, but explicit is safer and documents intent.
      const { data, error: err } = await supabase
        .from('users')
        .select('id, full_name, email, phone, role, team_id, avatar_url, is_active, created_at')
        .order('full_name');
      if (err) throw err;
      setMembers(data ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // FIX: supabase.auth.admin.createUser() requires the SERVICE ROLE key — it cannot be
  // called from the browser with the anon key. That was the root cause of the Teams error.
  // Replaced with supabase.auth.signUp() which works with anon key.
  // REQUIREMENT: In Supabase Dashboard → Auth → Settings, disable "Confirm email" so new
  // accounts are immediately active. Or use a server-side Edge Function for full admin control.
  const addMember = useCallback(async (member: Omit<IUser, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: member.email,
        password: 'Welcome@123',
        options: {
          data: { full_name: member.full_name },
        },
      });
      if (authErr) throw authErr;
      if (!authData.user) throw new Error('User creation failed — no user returned.');

      const { error: insertErr } = await supabase.from('users').insert({
        id: authData.user.id,
        full_name: member.full_name,
        email: member.email,
        phone: member.phone ?? null,
        role: member.role,
        team_id: member.team_id,
        avatar_url: null,
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
        .update(updates)
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
