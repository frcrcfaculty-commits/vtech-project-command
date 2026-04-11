import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, AlertTriangle, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { initials, cn } from '@/lib/utils';

import { useDashboardStats } from '@/hooks/useDashboardStats';

const kpiData = []; // Shadowed inside component

// Mock team members
const mockTeamMembers = [
  { name: 'Rahul Sharma', hoursToday: 4.5, currentTask: 'Install ceiling speakers — Reliance Jio HQ', noEntryDays: 0 },
  { name: 'Deepak Singh', hoursToday: 2.0, currentTask: 'Cable routing — Wipro Auditorium', noEntryDays: 0 },
  { name: 'Sachin More', hoursToday: 0, currentTask: null, noEntryDays: 1 },
  { name: 'Karan Patel', hoursToday: 0, currentTask: null, noEntryDays: 3 },
  { name: 'Neha Gupta', hoursToday: 6.0, currentTask: 'Programming control panel — Ambani Residence', noEntryDays: 0 },
];

// Mock tasks due this week
const mockTasksDueThisWeek = [
  { id: '1', title: 'Commission audio system', project: 'Reliance Jio HQ', assignee: 'Rahul Sharma', dueDate: '2026-04-08', status: 'in_progress' },
  { id: '2', title: 'Verify cable labels', project: 'Wipro Auditorium', assignee: 'Deepak Singh', dueDate: '2026-04-09', status: 'todo' },
  { id: '3', title: 'Test video wall outputs', project: 'Tata Experience Centre', assignee: 'Neha Gupta', dueDate: '2026-04-10', status: 'todo' },
  { id: '4', title: 'Submit AMC checklist', project: 'HDFC Training Rooms', assignee: 'Sachin More', dueDate: '2026-04-07', status: 'in_progress' },
];

const statusBadge: Record<string, { label: string; bg: string; text: string }> = {
  todo: { label: 'To Do', bg: 'bg-white/8', text: 'text-white/60' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-500/10', text: 'text-blue-700' },
  done: { label: 'Done', bg: 'bg-green-500/10', text: 'text-green-700' },
};

export function TeamLeadDashboard() {
  const { stats } = useDashboardStats();

  const kpiData = [
    { 
      label: 'Active Tasks', 
      value: stats?.activeProjects ? Math.round(stats.activeProjects * 2.5) : 18, 
      trend: stats?.trends.projects || 0, 
      icon: ClipboardList, 
      accent: 'var(--color-secondary,#DA2E8F)' 
    },
    { 
      label: 'Unverified Entries', 
      value: 6, 
      trend: 2, 
      icon: CheckCircle2, 
      accent: 'var(--color-warning,#F9A825)' 
    },
    { 
      label: 'Overdue Tasks', 
      value: stats?.overdueTasks || 0, 
      trend: stats?.trends.overdue || 0, 
      icon: AlertTriangle, 
      accent: 'var(--color-danger,#C62828)' 
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-bg,#F5F7FA)] p-4 md:p-6 lg:p-8">

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text,#1A1A2E)]">
          Team Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-secondary,#6B7280)] mt-1">
          Your team's activity and upcoming tasks
        </p>
      </header>

      {/* KPI Cards — 3 across on desktop, stack on mobile */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          const isGood = kpi.label === 'Overdue Tasks' || kpi.label === 'Unverified Entries'
            ? kpi.trend < 0
            : kpi.trend > 0;

          return (
            <div
              key={kpi.label}
              className="bg-[var(--color-surface,#ffffff)] rounded-lg shadow-sm border border-white/8 p-4 relative overflow-hidden"
              style={{ borderLeftWidth: 4, borderLeftColor: kpi.accent }}
            >
              <Icon className="absolute -right-2 -top-2 w-16 h-16 opacity-[0.06]" strokeWidth={1.2} />
              <p className="text-3xl font-bold text-[var(--color-text,#1A1A2E)] mb-1">{kpi.value}</p>
              <p className="text-sm text-[var(--color-text-secondary,#6B7280)] mb-3">{kpi.label}</p>
              <div className="flex items-center text-xs font-medium">
                {isGood
                  ? <ArrowUp className="w-3.5 h-3.5 mr-1 text-[var(--color-success,#2E7D32)]" />
                  : <ArrowDown className="w-3.5 h-3.5 mr-1 text-[var(--color-danger,#C62828)]" />
                }
                <span className={isGood ? 'text-[var(--color-success,#2E7D32)]' : 'text-[var(--color-danger,#C62828)]'}>
                  {Math.abs(kpi.trend)}%
                </span>
                <span className="text-white/40 ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* My Team Members */}
      <section className="bg-[var(--color-surface,#ffffff)] rounded-lg shadow-sm border border-white/8 mb-6">
        <div className="p-4 border-b border-white/8">
          <h3 className="text-lg font-semibold text-[var(--color-text,#1A1A2E)]">My Team Members</h3>
        </div>
        <ul className="divide-y divide-white/8">
          {mockTeamMembers.map((member, i) => (
            <li
              key={i}
              className={cn(
                'flex items-center gap-4 p-4 transition-colors',
                member.noEntryDays >= 2 && 'bg-red-500/10',
                member.noEntryDays === 1 && 'bg-yellow-500/10',
              )}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary,#723B8F)] flex items-center justify-center text-white text-sm font-bold">
                {initials(member.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--color-text,#1A1A2E)] text-sm truncate">
                  {member.name}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {member.currentTask ?? 'No active task'}
                </p>
              </div>

              {/* Hours / Warning */}
              <div className="flex-shrink-0 text-right">
                {member.hoursToday > 0 ? (
                  <span className="text-sm font-medium text-white/80">{member.hoursToday}h today</span>
                ) : member.noEntryDays >= 2 ? (
                  <span className="text-xs font-medium text-red-600">🔴 No entries for {member.noEntryDays} days</span>
                ) : (
                  <span className="text-xs font-medium text-yellow-700">⚠️ No entry</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Tasks Due This Week */}
      <section className="bg-[var(--color-surface,#ffffff)] rounded-lg shadow-sm border border-white/8">
        <div className="p-4 border-b border-white/8">
          <h3 className="text-lg font-semibold text-[var(--color-text,#1A1A2E)]">Tasks Due This Week</h3>
        </div>

        {/* Desktop table / Mobile card list */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-white/60">
            <thead className="bg-white/5 text-white/70 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {mockTasksDueThisWeek.map((task) => {
                const badge = statusBadge[task.status] ?? statusBadge.todo;
                return (
                  <tr key={task.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white/80">{task.title}</td>
                    <td className="px-4 py-3">{task.project}</td>
                    <td className="px-4 py-3">{task.assignee}</td>
                    <td className="px-4 py-3">{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', badge.bg, badge.text)}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-white/8">
          {mockTasksDueThisWeek.map((task) => {
            const badge = statusBadge[task.status] ?? statusBadge.todo;
            return (
              <div key={task.id} className="p-4">
                <p className="font-medium text-white/80 text-sm">{task.title}</p>
                <p className="text-xs text-white/50 mt-1">{task.project} · {task.assignee}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white/50">
                    Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', badge.bg, badge.text)}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-white/8">
          <Link
            to="/team"
            className="inline-flex items-center text-sm font-medium text-[var(--color-secondary,#DA2E8F)] hover:underline"
          >
            Verify Time Entries <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}
