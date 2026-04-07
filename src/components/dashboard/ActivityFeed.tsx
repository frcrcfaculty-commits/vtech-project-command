import { Clock, CheckCircle2, FolderPlus, Flag } from 'lucide-react';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { initials } from '@/lib/utils';

const typeConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  time: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  task: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  project: { icon: FolderPlus, color: 'text-purple-600', bg: 'bg-purple-100' },
  phase: { icon: Flag, color: 'text-orange-600', bg: 'bg-orange-100' },
};

export function ActivityFeed() {
  const { activity: activities, loading } = useDashboardCharts();
  
  if (loading) return <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-full flex items-center justify-center"><Spinner /></div>;
  if (!activities.length) return <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-full"><EmptyState title="No activity" description="No recent activity found" /></div>;

  return (
    <div className="bg-[var(--color-surface,#ffffff)] rounded-lg shadow-sm border border-gray-100 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text,#1A1A2E)]">Recent Activity</h3>
        <span className="text-xs text-gray-400">Auto-refreshes every 60s</span>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto max-h-[400px]">
        {activities.map((item, i: number) => {

          const cfg = typeConfig[item.type] ?? typeConfig.time;
          const Icon = cfg.icon;

          return (
            <li
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-primary,#0B1F3F)] flex items-center justify-center text-white text-xs font-bold">
                {initials(item.user)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug">
                  <span className="font-semibold">{item.user}</span>{' '}
                  <span className="text-gray-600">{item.action}</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                    <Icon className="w-3 h-3" />
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
