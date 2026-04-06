import { Navigate } from 'react-router-dom';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { TeamLeadDashboard } from '@/components/dashboard/TeamLeadDashboard';

import { useAuth } from '@/hooks/useAuth';


export function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'owner') return <OwnerDashboard />;
  if (user?.role === 'team_lead') return <TeamLeadDashboard />;
  return <Navigate to="/tasks" replace />;
}
