import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

export function TravelChart() {
  const { travelData, loading } = useDashboardCharts();
  
  if (loading) return <div className="bg-white/5 rounded-lg shadow-sm border border-white/8 p-4 h-full flex items-center justify-center"><Spinner /></div>;
  if (!travelData.length) return <div className="bg-white/5 rounded-lg shadow-sm border border-white/8 p-4 h-full"><EmptyState title="No travel data" description="No travel entries found" /></div>;

  // Option A implementation: Stacked Bar Chart
  const totalWork = travelData.reduce((acc, curr) => acc + curr.workHours, 0);
  const totalTravel = travelData.reduce((acc, curr) => acc + curr.travelHours, 0);
  const companyOverhead = Math.round((totalTravel / (totalWork + totalTravel)) * 100) || 0;

  return (
    <div className="bg-[var(--color-surface,#ffffff)] rounded-lg shadow-sm border border-white/8 p-4 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text,#1A1A2E)]">Travel vs Productive Hours</h3>
        <p className="text-sm mt-1 text-white/50">
          Company-wide travel overhead: <span className="font-bold text-white/80">{companyOverhead}%</span>
        </p>
        {companyOverhead > 25 && (
          <p className="text-sm text-[var(--color-warning,#F9A825)] font-medium mt-1">
            ⚠️ High travel overhead. Consider optimizing schedules.
          </p>
        )}
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={travelData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6B7280', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#F9FAFB' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const work = payload[0]?.value as number;
                  const travel = payload[1]?.value as number;
                  const total = work + travel;
                  const percent = Math.round((travel / total) * 100);
                  
                  return (
                    <div className="bg-white/5 border border-white/10 p-3 shadow-md rounded-md">
                      <p className="font-semibold text-white/80 mb-2">{label}</p>
                      {payload.map((entry, i) => (
                        <p key={i} className="text-sm text-white/60 flex items-center mb-1">
                          <span 
                            className="w-3 h-3 rounded-sm inline-block mr-2" 
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}: <span className="font-medium ml-1 text-white/80">{entry.value}h</span>
                        </p>
                      ))}
                      <div className="mt-2 pt-2 border-t border-white/8 text-sm font-medium text-white/70">
                        Travel Overhead: <span className={percent > 30 ? 'text-[var(--color-warning,#F9A825)]' : ''}>{percent}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Bar dataKey="workHours" name="Work Hours" stackId="a" fill="var(--color-secondary,#DA2E8F)" radius={[0, 0, 4, 4]} maxBarSize={40} />
            <Bar dataKey="travelHours" name="Travel Hours" stackId="a" maxBarSize={40} radius={[4, 4, 0, 0]}>
              {travelData.map((entry, index) => {
                const percent = Math.round((entry.travelHours / (entry.workHours + entry.travelHours)) * 100);
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={percent > 30 ? 'var(--color-warning,#F9A825)' : 'var(--color-accent,#FF6F00)'} 
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
