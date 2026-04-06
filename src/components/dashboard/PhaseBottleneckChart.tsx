import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mockPhaseData } from './mockData';

export function PhaseBottleneckChart() {
  const maxDays = Math.max(...mockPhaseData.map(d => d.avgDays));

  return (
    <div className="bg-[var(--color-surface,#ffffff)] rounded-lg shadow-sm border border-gray-100 p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-[var(--color-text,#1A1A2E)] mb-4">Average Days per Phase</h3>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockPhaseData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
            <XAxis type="number" textAnchor="end" tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis 
              dataKey="phase" 
              type="category" 
              tick={{ fill: '#4B5563', fontSize: 12 }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: '#F3F4F6' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 p-3 shadow-md rounded-md">
                      <p className="font-semibold text-gray-800 mb-1">{data.phase}</p>
                      <p className="text-sm text-gray-600">
                        Avg: <span className="font-medium text-gray-800">{data.avgDays} days</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Planned: {data.plannedDays} days
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="avgDays" radius={[0, 4, 4, 0]}>
              {mockPhaseData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.avgDays === maxDays ? 'var(--color-accent,#FF6F00)' : 'var(--color-secondary,#1E88E5)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
