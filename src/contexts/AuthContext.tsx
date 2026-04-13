import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { IUser } from '@/lib/types';

interface AuthContextValue {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isOwner: boolean;
  isTeamLead: boolean;
  isFieldStaff: boolean;
  isHR: boolean;
  isProjectManager: boolean;
  isProcurementManager: boolean;
  isAccounts: boolean;
  isSales: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const BASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function fetchProfile(userId: string, token: string): Promise<IUser | null> {
  try {
    const r = await fetch(`${BASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return rows?.[0] ?? null;
  } catch {
    return null;
  }
}

/** Race a promise against a timeout – always resolves */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Hard timeout: if getSession hangs, we still show the login page after 3s
    const fallbackTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth init timed out — showing login');
        setLoading(false);
      }
    }, 3000);

    (async () => {
      try {
        const result = await withTimeout(supabase.auth.getSession(), 2500);
        const session = result?.data?.session ?? null;
        if (session?.user && mounted) {
          const p = await fetchProfile(session.user.id, session.access_token);
          if (mounted) setUser(p);
        }
      } catch (err) {
        console.warn('Auth init error:', err);
      }
      if (mounted) setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_e, session) => {
        if (!mounted) return;
        if (session?.user) {
          const p = await fetchProfile(session.user.id, session.access_token);
          if (mounted) setUser(p);
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      const p = await fetchProfile(data.user!.id, data.session.access_token);
      setUser(p);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const p = await fetchProfile(user.id, session.access_token);
        setUser(p);
      }
    } catch (err) {
      console.warn('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isOwner: user?.role === 'owner',
        isTeamLead: user?.role === 'team_lead',
        isFieldStaff: user?.role === 'field_staff',
        isHR: user?.role === 'hr',
        isProjectManager: user?.role === 'project_manager',
        isProcurementManager: user?.role === 'procurement_manager',
        isAccounts: user?.role === 'accounts',
        isSales: user?.role === 'sales',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
