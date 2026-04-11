import { useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { TimeEntryForm } from '@/components/time-entry/TimeEntryForm';
import { DailySummary } from '@/components/time-entry/DailySummary';
import { WeeklySummary } from '@/components/time-entry/WeeklySummary';
import { CopyYesterday } from '@/components/time-entry/CopyYesterday';
import { VerificationList } from '@/components/time-entry/VerificationList';

type Tab = 'today' | 'week' | 'verify';

export function TimeEntryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [dailyTotal, setDailyTotal] = useState({ work: 0, travel: 0 });

  if (!user) return <Spinner size="lg" />;

  // Check if user is team lead for verification access
  const isTeamLead = user.role === 'team_lead';

  return (
    <div className="pb-24">
      {/* Tab Navigation */}
      <div className="sticky top-0 bg-white/5 border-b border-white/10 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('today')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'today'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-white/50 hover:text-white/70'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'week'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-white/50 hover:text-white/70'
              }`}
            >
              This Week
            </button>
            {isTeamLead && (
              <button
                onClick={() => setActiveTab('verify')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'verify'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-white/50 hover:text-white/70'
                }`}
              >
                Verify Entries
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white/5 border-t border-white/10 px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              setActiveTab('today');
              document.querySelector('[data-scroll-target="summary"]')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-medium text-white/70 hover:text-blue-600 transition-colors"
          >
            Today: <span className="font-bold">{dailyTotal.work}h</span> work · 
            <span className="font-bold ml-1">{dailyTotal.travel}h</span> travel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'today' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Log Time</h2>
              <TimeEntryForm userId={user.id} onTotalChange={setDailyTotal} />
            </div>
            <CopyYesterday userId={user.id} />
            <div data-scroll-target="summary">
              <h2 className="text-lg font-semibold mb-4">Today's Entries</h2>
              <DailySummary userId={user.id} onTotalChange={setDailyTotal} />
            </div>
          </div>
        )}

        {activeTab === 'week' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Weekly Summary</h2>
            <WeeklySummary userId={user.id} />
          </div>
        )}

        {activeTab === 'verify' && isTeamLead && user.team_id && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Verify Team Entries</h2>
            <VerificationList teamId={user.team_id} verifierId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
}
