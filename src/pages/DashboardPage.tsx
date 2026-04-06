import { Navigate } from 'react-router-dom';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { TeamLeadDashboard } from '@/components/dashboard/TeamLeadDashboard';

// Stub useAuth until hook agent delivers it
// Replace with: import { useAuth } from '@/hooks/useAuth';
function useAuth() {
  return {
    user: { id: '1', name: 'Admin', role: 'owner' as const },
  };
}

export function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'owner') return <OwnerDashboard />;
  if (user?.role === 'team_lead') return <TeamLeadDashboard />;
  return <Navigate to="/tasks" replace />;
}
