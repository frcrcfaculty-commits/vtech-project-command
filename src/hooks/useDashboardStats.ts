import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  activeProjects: number;
  totalHoursMonth: number;
  travelOverhead: number;
  overdueTasks: number;
  trends: {
    projects: number;
    hours: number;
    travel: number;
    overdue: number;
  };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Active projects count
      const { count: activeProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // 2. Overdue tasks count
      const { count: overdueTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue');

      // 3. This month's hours (sum of time entries)
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .gte('entry_date', firstDayOfMonth.toISOString());

      const totalMinutes = timeEntries?.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0;
      const totalHours = Math.round(totalMinutes / 60);

      // Dummy trends for now, as we don't have historical aggregation yet
      setStats({
        activeProjects: activeProjects || 0,
        totalHoursMonth: totalHours,
        travelOverhead: 18, // Hardcoded for now
        overdueTasks: overdueTasks || 0,
        trends: {
          projects: 5,
          hours: 12,
          travel: -2,
          overdue: -15
        }
      });
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
