import React, { useEffect, useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Calendar, 
  CheckSquare, 
  Square,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { cn, formatDate, getPhaseLabel } from '@/lib/utils';
import { SUSPICIOUS_WORK_HOURS, SUSPICIOUS_TRAVEL_HOURS } from '@/lib/constants';

interface VerificationListProps {
  teamId: string;
  verifierId: string;
}

export function VerificationList({ teamId, verifierId }: VerificationListProps) {
  const { entries, loading, fetchUnverified, bulkVerify, verifyEntry } = useTimeEntries();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchUnverified(teamId);
  }, [teamId, fetchUnverified]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, typeof entries> = {};
    entries.forEach(entry => {
      const userName = entry.user?.full_name || 'Unknown User';
      if (!groups[userName]) groups[userName] = [];
      groups[userName].push(entry);
    });
    return groups;
  }, [entries]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map(e => e.id));
    }
  };

  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) return;
    setVerifying(true);
    await bulkVerify(selectedIds, verifierId);
    await fetchUnverified(teamId);
    setSelectedIds([]);
    setVerifying(false);
  };

  const handleSingleVerify = async (id: string) => {
    await verifyEntry(id, verifierId);
    await fetchUnverified(teamId);
  };

  const isSuspicious = (entry: any) => {
    return (
      Number(entry.work_hours) > SUSPICIOUS_WORK_HOURS ||
      Number(entry.travel_hours) > SUSPICIOUS_TRAVEL_HOURS ||
      !entry.notes
    );
  };

  if (loading && entries.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium animate-pulse uppercase tracking-widest">Scanning Team Logs</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-16 text-center bg-white/5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">All Logs Verified!</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Your team is up to date. No pending time entries to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions Header */}
      <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md p-4 rounded-2xl border border-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            {selectedIds.length === entries.length ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            {selectedIds.length === 0 ? 'Select All' : `${selectedIds.length} Selected`}
          </button>
          
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3 h-3" />
            Pending: {entries.length}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkVerify}
            disabled={verifying}
            className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {verifying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Verify Selected
          </button>
        )}
      </div>

      {/* Grouped Lists */}
      {Object.entries(groupedEntries).map(([userName, userEntries]) => (
        <div key={userName} className="space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <h3 className="font-bold text-slate-900">{userName}</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {userEntries.length} entries
            </span>
          </div>

          <div className="grid gap-3">
            {userEntries.map((entry) => (
              <div 
                key={entry.id}
                onClick={() => toggleSelect(entry.id)}
                className={cn(
                  "group relative bg-white/5 rounded-2xl p-4 border transition-all cursor-pointer",
                  selectedIds.includes(entry.id) 
                    ? "border-blue-600 ring-4 ring-blue-50" 
                    : "border-slate-100 hover:border-slate-200 shadow-sm"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {selectedIds.includes(entry.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          {formatDate(entry.entry_date || '')}

                        </div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {entry.project?.name}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-sm font-bold text-slate-900 tabular-nums">
                          {Number(entry.work_hours) + Number(entry.travel_hours)}h Total
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                          {entry.work_hours}w / {entry.travel_hours}t
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">
                        {entry.phase?.phase_name ? getPhaseLabel(entry.phase.phase_name as any) : 'General'}
                      </span>
                      {isSuspicious(entry) && (
                        <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-black uppercase tracking-wider animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          Suspicious
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50/50 p-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {entry.task?.title || 'No Task'}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      <div className="line-clamp-1 italic">
                        {entry.notes || 'No notes provided'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSingleVerify(entry.id);
                    }}
                    className="self-center p-3 bg-slate-50 text-slate-400 hover:bg-green-500/10 hover:text-green-600 rounded-xl transition-all"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
