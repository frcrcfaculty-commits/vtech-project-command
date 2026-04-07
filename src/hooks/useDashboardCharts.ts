import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import type { PhaseName } from '@/lib/types';
import { PHASE_CONFIG } from '@/lib/constants';

export interface PhaseBottleneckRow { phase: string; avgDays: number; plannedDays: number; }
export interface TeamPerfRow { team: string; hours: number; tasksCompleted: number; overdue: number; }
export interface TravelRow { name: string; workHours: number; travelHours: number; }
export interface ProjectHealthRow {
  id: string; name: string; client: string; type: string; status: string;
  phase: string; daysLeft: number; hours: number; health: 'green' | 'yellow' | 'red';
}
export interface ActivityRow { user: string; action: string; time: string; type: string; }
export interface MissingMember { name: string; team: string; consecutiveDays: number; }
export function useDashboardCharts() {
  const [phaseData, setPhaseData] = useState<PhaseBottleneckRow[]>([]);
  const [teamData, setTeamData] = useState<TeamPerfRow[]>([]);
  const [travelData, setTravelData] = useState<TravelRow[]>([]);
  const [projectHealth, setProjectHealth] = useState<ProjectHealthRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [missingMembers, setMissingMembers] = useState<MissingMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    // 1. PHASE BOTTLENECK — avg days per phase across all projects
    const { data: phases } = await supabase
      .from('project_phases')
      .select('phase_name, planned_start, planned_end, actual_start, actual_end');

    const phaseAggregates: Record<string, { actual: number[]; planned: number[] }> = {};
    phases?.forEach((p) => {
      if (!phaseAggregates[p.phase_name]) phaseAggregates[p.phase_name] = { actual: [], planned: [] };
      if (p.actual_start && p.actual_end) {
        const days = (new Date(p.actual_end).getTime() - new Date(p.actual_start).getTime()) / 86400000;
        phaseAggregates[p.phase_name].actual.push(days);
      }
      if (p.planned_start && p.planned_end) {
        const days = (new Date(p.planned_end).getTime() - new Date(p.planned_start).getTime()) / 86400000;
        phaseAggregates[p.phase_name].planned.push(days);
      }
    });

    const phaseRows: PhaseBottleneckRow[] = PHASE_CONFIG.map((cfg) => {
      const agg = phaseAggregates[cfg.name];
      const avgActual = agg?.actual.length ? agg.actual.reduce((a, b) => a + b) / agg.actual.length : 0;
      const avgPlanned = agg?.planned.length ? agg.planned.reduce((a, b) => a + b) / agg.planned.length : 0;
      return { phase: cfg.label, avgDays: Math.round(avgActual * 10) / 10, plannedDays: Math.round(avgPlanned * 10) / 10 };
    });
    setPhaseData(phaseRows);

    // 2. TEAM PERFORMANCE
    const { data: teams } = await supabase.from('teams').select('id, name');
    const teamRows: TeamPerfRow[] = [];
    for (const team of teams || []) {
      const { data: members } = await supabase.from('users').select('id').eq('team_id', team.id);
      const memberIds = members?.map((m) => m.id) || [];
      if (memberIds.length === 0) {
        teamRows.push({ team: team.name, hours: 0, tasksCompleted: 0, overdue: 0 });
        continue;
      }
      const { data: entries } = await supabase
        .from('time_entries')
        .select('work_hours')
        .in('user_id', memberIds);
      const hours = entries?.reduce((s, e) => s + Number(e.work_hours), 0) || 0;

      const { count: completed } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .in('assigned_to', memberIds)
        .eq('status', 'done');

      const today = format(new Date(), 'yyyy-MM-dd');
      const { count: overdue } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .in('assigned_to', memberIds)
        .lt('due_date', today)
        .neq('status', 'done');

      teamRows.push({
        team: team.name,
        hours: Math.round(hours),
        tasksCompleted: completed || 0,
        overdue: overdue || 0,
      });
    }
    setTeamData(teamRows);

    // 3. TRAVEL VS WORK
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('status', 'active')
      .limit(10);

    const travelRows: TravelRow[] = [];
    for (const p of projects || []) {
      const { data: pe } = await supabase
        .from('time_entries')
        .select('work_hours, travel_hours')
        .eq('project_id', p.id);
      travelRows.push({
        name: p.name,
        workHours: Math.round(pe?.reduce((s, e) => s + Number(e.work_hours), 0) || 0),
        travelHours: Math.round(pe?.reduce((s, e) => s + Number(e.travel_hours), 0) || 0),
      });
    }
    setTravelData(travelRows);

    // 4. PROJECT HEALTH
    const { data: allProjects } = await supabase
      .from('projects')
      .select('*, project_phases(phase_name, status)')
      .in('status', ['active', 'planning']);

    const today = new Date();
    const healthRows: ProjectHealthRow[] = (allProjects || []).map((p: any) => {
      const start = new Date(p.start_date);
      const end = new Date(p.target_end_date);
      const totalDays = Math.max(1, (end.getTime() - start.getTime()) / 86400000);
      const elapsedDays = Math.max(0, (today.getTime() - start.getTime()) / 86400000);
      const elapsedRatio = elapsedDays / totalDays;
      const completedPhases = p.project_phases?.filter((ph: any) => ph.status === 'completed').length || 0;
      const completion = completedPhases / 10;
      const inProgressPhase = p.project_phases?.find((ph: any) => ph.status === 'in_progress');
      const daysLeft = Math.round((end.getTime() - today.getTime()) / 86400000);

      let health: 'green' | 'yellow' | 'red' = 'green';
      if (completion < elapsedRatio - 0.2) health = 'red';
      else if (completion < elapsedRatio) health = 'yellow';

      return {
        id: p.id,
        name: p.name,
        client: p.client_name,
        type: p.project_type,
        status: p.status,
        phase: inProgressPhase?.phase_name || 'not_started',
        daysLeft,
        hours: 0, // optional enhancement: sum from time_entries
        health,
      };
    });
    setProjectHealth(healthRows);

    // 5. ACTIVITY FEED — latest 20 time entries with user names
    const { data: recentEntries } = await supabase
      .from('time_entries')
      .select('work_hours, travel_hours, created_at, users(full_name), projects(name), project_phases(phase_name)')
      .order('created_at', { ascending: false })
      .limit(20);

    const activityRows: ActivityRow[] = (recentEntries || []).map((e: any) => ({
      user: e.users?.full_name || 'Unknown',
      action: `logged ${e.work_hours}h on ${e.projects?.name || 'project'} — ${e.project_phases?.phase_name || ''}`,
      time: format(new Date(e.created_at), 'PP'),
      type: 'time',
    }));
    setActivity(activityRows);

    // 6. MISSING TIME ENTRIES
    const { data: allUsers } = await supabase.from('users').select('id, full_name, teams(name)');
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const { data: todayEntries } = await supabase
      .from('time_entries')
      .select('user_id')
      .gte('date', todayStr);
    
    const usersWithEntries = new Set(todayEntries?.map(e => e.user_id));
    const missingRows: MissingMember[] = (allUsers || [])
      .filter(u => !usersWithEntries.has(u.id))
      .map(u => ({
        name: u.full_name || 'Unknown',
        team: (u.teams as any)?.name || 'Unassigned',
        consecutiveDays: 1, // Simplified for now
      }));
    setMissingMembers(missingRows);

    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { phaseData, teamData, travelData, projectHealth, activity, missingMembers, loading, refresh: fetchAll };
}
