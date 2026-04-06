import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  addWeeks, 
  subWeeks, 
  isSameDay,
  isToday 
} from 'date-fns';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { cn } from '@/lib/utils';

interface WeeklySummaryProps {
  userId: string;
}

export function WeeklySummary({ userId }: WeeklySummaryProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { entries, loading, fetchByDateRange } = useTimeEntries();

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
    });
  }, [currentWeekStart]);

  useEffect(() => {
    const start = format(weekDays[0], 'yyyy-MM-dd');
    const end = format(weekDays[6], 'yyyy-MM-dd');
    fetchByDateRange(userId, start, end);
  }, [userId, weekDays, fetchByDateRange]);

  // Aggregate data for the grid: { [projectId]: { [date]: hours } }
  const gridData = useMemo(() => {
    const data: Record<string, { name: string, days: Record<string, number> }> = {};
    
    entries.forEach(entry => {
      const projectId = entry.project_id;
      const projectName = entry.project?.name || 'Unknown Project';
      const dateKey = entry.entry_date;
      
      if (!data[projectId]) {
        data[projectId] = { name: projectName, days: {} };
      }
      
      data[projectId].days[dateKey] = (data[projectId].days[dateKey] || 0) + Number(entry.work_hours);
    });
    
    return data;
  }, [entries]);

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    return weekDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return entries
        .filter(e => e.entry_date === dateKey)
        .reduce((sum, e) => sum + Number(e.work_hours), 0);
    });
  }, [entries, weekDays]);

  const getCellColor = (hours: number, isWeekend: boolean) => {
    if (hours === 0) return isWeekend ? 'bg-slate-50' : 'bg-white';
    if (hours >= 8) return 'bg-green-100 text-green-800';
    if (hours >= 4) return 'bg-amber-100 text-amber-800';
    return 'bg-red-50 text-red-600';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header / Week Picker */}
      <div className="p-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-900">
            {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
          </h3>
        </div>
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button 
            onClick={() => navigateWeek('prev')}
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button 
            onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-3 py-1 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Today
          </button>
          <button 
            onClick={() => navigateWeek('next')}
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Updating Grid</p>
        </div>
      ) : Object.keys(gridData).length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No hours logged for this week.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="sticky left-0 bg-slate-50/50 px-4 py-3 text-left border-b border-r border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider min-w-[140px] backdrop-blur-sm z-10">
                  Project
                </th>
                {weekDays.map((day, i) => (
                  <th 
                    key={i} 
                    className={cn(
                      "px-2 py-3 text-center border-b border-slate-100 text-xs font-bold uppercase tracking-wider min-w-[60px]",
                      isToday(day) ? "text-blue-600" : "text-slate-400"
                    )}
                  >
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{format(day, 'd')}</div>
                  </th>
                )}
                <th className="px-4 py-3 text-center border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(gridData).map(([id, project]) => {
                const projectTotal = Object.values(project.days).reduce((s, h) => s + h, 0);
                return (
                  <tr key={id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="sticky left-0 bg-white group-hover:bg-slate-50/30 px-4 py-3 border-b border-r border-slate-100 text-sm font-bold text-slate-900 line-clamp-1 backdrop-blur-sm z-10">
                      {project.name}
                    </td>
                    {weekDays.map((day, i) => {
                      const dateKey = format(day, 'yyyy-MM-dd');
                      const hours = project.days[dateKey] || 0;
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      return (
                        <td 
                          key={i} 
                          className={cn(
                            "p-1 border-b border-slate-100 text-center font-mono text-sm",
                            getCellColor(hours, isWeekend)
                          )}
                        >
                          {hours > 0 ? hours : '-'}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 border-b border-slate-100 text-center text-sm font-bold text-slate-900 bg-slate-50/30 font-mono">
                      {projectTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/50 font-bold">
                <td className="sticky left-0 bg-slate-50/50 px-4 py-3 border-r border-slate-100 text-xs text-slate-500 uppercase tracking-wider backdrop-blur-sm z-10">
                  Daily Totals
                </td>
                {dailyTotals.map((total, i) => (
                  <td 
                    key={i} 
                    className={cn(
                      "px-2 py-3 text-center text-sm font-mono",
                      total >= 8 ? "text-green-700" : total >= 4 ? "text-amber-700" : "text-slate-400"
                    )}
                  >
                    {total}h
                  </td>
                )}
                <td className="px-4 py-3 text-center text-sm font-mono text-slate-900 bg-slate-100/50">
                  {dailyTotals.reduce((a, b) => a + b, 0)}h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex flex-wrap gap-4 items-center justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-100 rounded" />
          <span>At Risk (&lt; 4h)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-100 rounded" />
          <span>Partial (4-8h)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-100 rounded" />
          <span>Target (&ge; 8h)</span>
        </div>
      </div>
    </div>
  );
}
