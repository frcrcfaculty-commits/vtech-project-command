import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { TimeEntryForm } from '@/components/time-entry/TimeEntryForm';

export function TimeEntryPage() {
  const { user } = useAuth();
  if (!user) return <Spinner size="lg" />;
  return (
    <div className="max-w-xl mx-auto">
      <TimeEntryForm userId={user.id} />
    </div>
  );
}
