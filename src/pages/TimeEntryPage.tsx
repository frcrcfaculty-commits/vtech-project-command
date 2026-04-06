import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { TimeEntryForm } from '@/components/time-entry/TimeEntryForm';
import { DailySummary } from '@/components/time-entry/DailySummary';
import { WeeklySummary } from '@/components/time-entry/WeeklySummary';
import { CopyYesterday } from '@/components/time-entry/CopyYesterday';
import { VerificationList } from '@/components/time-entry/VerificationList';
import { Clock, Calendar, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ITimeEntry } from '@/lib/types';

export function TimeEntryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'verify'>('today');
  const { entries, fetchToday, loading } = useTimeEntries();

  // Scroll to daily summary using ref
  const dailySummaryRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchToday(user.id);
    }
  }, [user?.id, fetchToday]);

  if (!user) return null;

  const totalWork = entries.reduce((sum, e) => sum + Number(e.work_hours), 0);
  const totalTravel = entries.reduce((sum, e) => sum + Number(e.travel_hours), 0);
  const totalHours = totalWork + totalTravel;

  const scrollToSummary = () => {
    dailySummaryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditEntry = (entry: ITimeEntry) => {
    // Editing logic can be implemented here (e.g. populating form via state or URL search params)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Header Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('today')}
              className={cn(
                "py-4 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2",
                activeTab === 'today' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Clock className="w-4 h-4" />
              <span>Today</span>
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={cn(
                "py-4 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2",
                activeTab === 'week' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              <Calendar className="w-4 h-4" />
              <span>This Week</span>
            </button>
            {user.role === 'team_lead' && (
              <button
                onClick={() => setActiveTab('verify')}
                className={cn(
                  "py-4 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ml-auto",
                  activeTab === 'verify' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
                )}
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Verify Team</span>
                <span className="sm:hidden">Verify</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {activeTab === 'today' && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Log Time</h1>
              <CopyYesterday userId={user.id} onSuccess={() => fetchToday(user.id)} />
            </div>
            
            <TimeEntryForm userId={user.id} />
            
            <div ref={dailySummaryRef} className="pt-4 scroll-mt-20">
              <DailySummary userId={user.id} onEdit={handleEditEntry} />
            </div>
          </>
        )}

        {activeTab === 'week' && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Weekly Timesheet</h1>
            <WeeklySummary userId={user.id} />
          </>
        )}

        {activeTab === 'verify' && user.role === 'team_lead' && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Verify Team Logs</h1>
            <VerificationList teamId={user.team_id} verifierId={user.id} />
          </>
        )}
      </div>

      {/* Persistent Bottom Bar (Mobile Optimization T32) */}
      {activeTab === 'today' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40 md:hidden animate-in slide-in-from-bottom-2">
          <div 
            onClick={scrollToSummary}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="font-bold text-slate-700">Today</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-blue-600 font-bold">{totalWork}h work</span>
              <span className="text-slate-300">·</span>
              <span className="text-amber-600 font-bold">{totalTravel}h travel</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
