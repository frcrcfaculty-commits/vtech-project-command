import React, { useEffect } from 'react';
import { Trash2, Edit3, MapPin, CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { cn, formatHours, getPhaseLabel } from '@/lib/utils';
import { ITimeEntry } from '@/lib/types';

interface DailySummaryProps {
  userId: string;
  onEdit?: (entry: ITimeEntry) => void;
}

export function DailySummary({ userId, onEdit }: DailySummaryProps) {
  const { entries, loading, fetchToday, deleteEntry } = useTimeEntries();

  useEffect(() => {
    fetchToday(userId);
  }, [userId, fetchToday]);

  const totalWork = entries.reduce((sum, e) => sum + Number(e.work_hours), 0);
  const totalTravel = entries.reduce((sum, e) => sum + Number(e.travel_hours), 0);
  const totalHours = totalWork + totalTravel;

  const getSummaryColor = () => {
    if (totalHours >= 8) return 'text-green-600 bg-green-50 border-green-100';
    if (totalHours >= 4) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await deleteEntry(id);
      fetchToday(userId);
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-slate-100" />
        <div className="h-4 w-32 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className={cn(
        "p-4 rounded-2xl border flex items-center justify-between transition-colors",
        getSummaryColor()
      )}>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 opacity-70" />
          <span className="font-semibold">Today's Summary</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">
            {totalHours}h <span className="text-sm font-medium opacity-70">Total</span>
          </div>
          <div className="text-xs opacity-70">
            {totalWork}h work + {totalTravel}h travel
          </div>
        </div>
      </div>

      {totalHours > 12 && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>You've logged over 12 hours today. Please verify.</span>
        </div>
      )}

      {/* Entry List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-12 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
              <Clock className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No time logged today yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add an entry above to get started.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div 
              key={entry.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {entry.project?.name || 'Unknown Project'}
                    {entry.verified_by && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                      {entry.project_phases?.phase_name ? getPhaseLabel(entry.project_phases.phase_name as any) : 'General'}
                    </span>
                    {entry.task?.title && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        {entry.task.title}
                      </span>
                    )}
                  </div>
                </div>
                
                {!entry.verified_by && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit?.(entry)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{entry.work_hours}h work</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{entry.travel_hours}h travel</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span>{entry.city}</span>
                </div>
              </div>

              {entry.notes && (
                <div className="mt-3 text-xs text-slate-500 italic border-t border-slate-50 pt-3 line-clamp-1">
                  "{entry.notes}"
                </div>
              )}
              
              {entry.verified_by && (
                <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-green-600 pt-3 border-t border-slate-50">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
