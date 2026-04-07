import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfMonth, format, subMonths, endOfMonth } from 'date-fns';

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
      const today = format(new Date(), 'yyyy-MM-dd');
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
      const lastMonthStart = format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
      const lastMonthEnd = format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');

      // 1. Active projects count
      const { count: activeProjects } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: lastMonthProjects } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .lte('created_at', lastMonthEnd);

      // 2. Overdue tasks (correct logic — no 'overdue' status in DB)
      const { count: overdueTasks } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .lt('due_date', today)
        .neq('status', 'done');

      // 3. This month's hours
      const { data: thisMonthEntries } = await supabase
        .from('time_entries')
        .select('work_hours, travel_hours')
        .gte('entry_date', monthStart)
        .lte('entry_date', monthEnd);

      const thisMonthWork = thisMonthEntries?.reduce((s, e) => s + Number(e.work_hours), 0) || 0;
      const thisMonthTravel = thisMonthEntries?.reduce((s, e) => s + Number(e.travel_hours), 0) || 0;
      const thisMonthTotal = thisMonthWork + thisMonthTravel;

      // 4. Last month for trends
      const { data: lastMonthEntries } = await supabase
        .from('time_entries')
        .select('work_hours, travel_hours')
        .gte('entry_date', lastMonthStart)
        .lte('entry_date', lastMonthEnd);

      const lastMonthWork = lastMonthEntries?.reduce((s, e) => s + Number(e.work_hours), 0) || 0;
      const lastMonthTravel = lastMonthEntries?.reduce((s, e) => s + Number(e.travel_hours), 0) || 0;
      const lastMonthTotal = lastMonthWork + lastMonthTravel;

      // 5. Travel overhead
      const travelOverhead = thisMonthTotal > 0
        ? Math.round((thisMonthTravel / thisMonthTotal) * 100)
        : 0;
      const lastTravelPct = lastMonthTotal > 0
        ? Math.round((lastMonthTravel / lastMonthTotal) * 100)
        : 0;

      // 6. Trend calculations (% change)
      const pctChange = (curr: number, prev: number) =>
        prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

      setStats({
        activeProjects: activeProjects || 0,
        totalHoursMonth: Math.round(thisMonthWork),
        travelOverhead,
        overdueTasks: overdueTasks || 0,
        trends: {
          projects: pctChange(activeProjects || 0, lastMonthProjects || 0),
          hours: pctChange(thisMonthWork, lastMonthWork),
          travel: travelOverhead - lastTravelPct,
          overdue: 0, // Need historical snapshot table for this; leave 0 for now
        },
      });
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
