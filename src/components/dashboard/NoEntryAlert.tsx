import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { NO_ENTRY_ALERT_HOUR } from '@/lib/constants';

export function NoEntryAlert() {
  const [expanded, setExpanded] = useState(false);
  const { missingMembers, loading } = useDashboardCharts();
  const currentHour = new Date().getHours();

  if (loading || currentHour < NO_ENTRY_ALERT_HOUR || !missingMembers || missingMembers.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-500/10 border border-orange-200 rounded-lg p-4 mb-6 shadow-sm transition-all duration-300">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center text-orange-800 font-medium">
          <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
          <span>⚠️ {missingMembers.length} team members haven't logged time today</span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-orange-600" /> : <ChevronDown className="w-5 h-5 text-orange-600" />}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-orange-200">
          <ul className="space-y-2">
            {missingMembers.map((member, i) => (
              <li 
                key={i} 
                className={`flex justify-between items-center text-sm p-2 rounded-md ${
                  member.consecutiveDays >= 2 ? 'bg-red-500/10 text-red-700 font-medium' : 'bg-white/5 text-white/70'
                }`}
              >
                <span>
                  <span className="font-semibold">{member.name}</span> <span className="text-white/50 text-xs">({member.team})</span>
                </span>
                {member.consecutiveDays >= 2 && (
                  <span className="text-xs text-red-600 flex items-center">
                    🔴 No entries for {member.consecutiveDays} days
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
