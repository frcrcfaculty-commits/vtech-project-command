import { useState } from 'react';
import { Briefcase, Clock, TrendingUp, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { PhaseBottleneckChart } from './PhaseBottleneckChart';
import { TeamPerformanceChart } from './TeamPerformanceChart';
import { TravelChart } from './TravelChart';
import { ProjectHealthTable } from './ProjectHealthTable';
import { NoEntryAlert } from './NoEntryAlert';
import { ActivityFeed } from './ActivityFeed';
import { cn } from '@/lib/utils';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/Skeleton';

type DateRange = 'week' | 'month' | 'quarter';

export function OwnerDashboard() {
  const { stats, loading } = useDashboardStats();
  const [dateRange, setDateRange] = useState<DateRange>('month');

  // KPI display configuration
  const kpiData = [
    {
      label: 'Active Projects',
      value: stats?.activeProjects || 0,
      trend: stats?.trends.projects || 0,
      icon: Briefcase,
      accent: 'var(--color-secondary,#DA2E8F)',
    },
    {
      label: 'Hours This Month',
      value: stats?.totalHoursMonth || 0,
      trend: stats?.trends.hours || 0,
      icon: Clock,
      accent: 'var(--color-success,#2E7D32)',
    },
    {
      label: 'Travel Overhead',
      value: `${stats?.travelOverhead || 0}%`,
      trend: stats?.trends.travel || 0,
      icon: TrendingUp,
      accent: 'var(--color-accent,#FF6F00)',
    },
    {
      label: 'Overdue Tasks',
      value: stats?.overdueTasks || 0,
      trend: stats?.trends.overdue || 0,
      icon: AlertTriangle,
      accent: 'var(--color-danger,#C62828)',
    },
  ];



  return (
    <main className="min-h-screen bg-[var(--color-bg,#F5F7FA)] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-sm text-white/75 mt-1">
            Overview of all projects and team performance
          </p>
        </div>

        {/* Date range picker */}
        <div className="flex bg-white/8 rounded-md p-1 shadow-inner">
          {([
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'quarter', label: 'This Quarter' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={cn(
                'px-4 py-2 min-h-[36px] text-sm font-medium rounded-sm transition-all whitespace-nowrap',
                dateRange === key
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/65 hover:text-white/90'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* No-entry alert banner */}
      <NoEntryAlert />

      {/* KPI Cards — 2x2 on mobile, 4 across on desktop */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = typeof kpi.trend === 'number' && kpi.trend > 0;
          // For overdue tasks and travel overhead, "positive trend" is actually bad
          const isGood =
            kpi.label === 'Overdue Tasks' || kpi.label === 'Travel Overhead'
              ? !isPositive
              : isPositive;

          return (
            <div
              key={kpi.label}
              className="bg-[var(--color-surface,#ffffff)] rounded-lg shadow-sm border border-white/8 p-4 relative overflow-hidden"
              style={{ borderLeftWidth: 4, borderLeftColor: kpi.accent }}
            >
              {/* Icon watermark */}
              <Icon
                className="absolute -right-2 -top-2 w-16 h-16 opacity-[0.06]"
                strokeWidth={1.2}
              />

              <p className="text-3xl font-bold text-white mb-1">
                {kpi.value}
              </p>
              <p className="text-sm text-white/85 mb-3">
                {kpi.label}
              </p>

              <div className="flex items-center text-xs font-medium">
                {isGood ? (
                  <ArrowUp className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 mr-1 text-red-400" />
                )}
                <span className={isGood ? 'text-emerald-400' : 'text-red-400'}>
                  {Math.abs(typeof kpi.trend === 'number' ? kpi.trend : 0)}%
                </span>
                <span className="text-white/65 ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Charts row 1 */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="overflow-x-auto">
          <PhaseBottleneckChart />
        </div>
        <div className="overflow-x-auto">
          <TeamPerformanceChart />
        </div>
      </section>

      {/* Charts row 2 */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="overflow-x-auto">
          <TravelChart />
        </div>
        <ActivityFeed />
      </section>

      {/* Full-width table */}
      <section className="mb-6">
        <ProjectHealthTable />
      </section>
    </main>
  );
}
