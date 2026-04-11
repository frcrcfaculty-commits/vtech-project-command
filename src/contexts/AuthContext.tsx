import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { IUser } from '@/lib/types';

interface AuthContextValue {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isOwner: boolean;
  isTeamLead: boolean;
  isFieldStaff: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const URL = import.meta.env.VITE_SUPABASE_URL as string;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function fetchProfile(userId: string, token: string): Promise<IUser | null> {
  try {
    const r = await fetch(`${URL}/rest/v1/users?id=eq.${userId}&select=*`, {
      headers: { apikey: KEY, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return rows?.[0] ?? null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && mounted) {
        const p = await fetchProfile(session.user.id, session.access_token);
        if (mounted) setUser(p);
      }
      if (mounted) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (!mounted) return;
      if (session?.user) {
        const p = await fetchProfile(session.user.id, session.access_token);
        if (mounted) setUser(p);
      } else setUser(null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      const p = await fetchProfile(data.user!.id, data.session.access_token);
      setUser(p);
    }
  };

  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isOwner: user?.role === 'owner',
      isTeamLead: user?.role === 'team_lead',
      isFieldStaff: user?.role === 'field_staff',
    }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
