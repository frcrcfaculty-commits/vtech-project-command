import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';


type MetricType = 'hours' | 'tasksCompleted' | 'overdue';

export function TeamPerformanceChart() {
  const [metric, setMetric] = useState<MetricType>('hours');
  const { teamData, loading } = useDashboardCharts();

  if (loading) return <div className="bg-white/5 rounded-lg shadow-sm border border-white/8 p-4 h-full flex items-center justify-center"><Spinner /></div>;
  if (!teamData.length) return <div className="bg-white/5 rounded-lg shadow-sm border border-white/8 p-4 h-full"><EmptyState title="No team data" description="No team performance data found" /></div>;

  // Find best team based on current metric
  const bestTeam = [...teamData].sort((a, b) => {
    if (metric === 'overdue') return a.overdue - b.overdue; // lower is better for overdue
    return (b as any)[metric] - (a as any)[metric]; // higher is better
  })[0];


  const getMetricLabel = (m: MetricType) => {
    switch(m) {
      case 'hours': return 'Hours Logged';
      case 'tasksCompleted': return 'Tasks Completed';
      case 'overdue': return 'Overdue Tasks';
    }
  };

  return (
    <div className="bg-[var(--color-surface,#ffffff)] rounded-lg shadow-sm border border-white/8 p-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text,#1A1A2E)]">Team Performance</h3>
          <p className="text-sm text-white/50 mt-1">
            Best team: <span className="font-medium text-[var(--color-secondary,#DA2E8F)]">{bestTeam.team}</span>
          </p>

        </div>
        
        <div className="flex bg-white/8 rounded-md p-1">
          {(['hours', 'tasksCompleted', 'overdue'] as MetricType[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
                metric === m 
                  ? "bg-white/5 text-[var(--color-primary,#723B8F)] shadow-sm" 
                  : "text-white/60 hover:text-white/90"
              )}
            >
              {getMetricLabel(m)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={teamData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="team" 
              tick={{ fill: '#6B7280', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
            />

            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#F9FAFB' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/5 border border-white/10 p-3 shadow-md rounded-md">
                      <p className="font-semibold text-white/80 mb-1">{payload[0].payload.team}</p>

                      <p className="text-sm text-white/60 flex items-center">
                        <span 
                          className="w-3 h-3 rounded-sm inline-block mr-2" 
                          style={{ backgroundColor: payload[0].color }}
                         />
                        {getMetricLabel(metric)}: <span className="font-medium ml-1 text-white/80">{payload[0].value}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey={metric} radius={[4, 4, 0, 0]} maxBarSize={50} animationDuration={500}>
              {teamData.map((entry, index: number) => (

                <Cell 
                  key={`cell-${index}`} 
                  fill={metric === 'overdue' ? 'var(--color-danger,#C62828)' : 'var(--color-secondary,#DA2E8F)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
