import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

export function TimeEntryPage() {
  const { user } = useAuth();
  if (!user) return <Spinner size="lg" />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Time Entry</h1>
      <Card>
        <p className="text-[var(--color-text-secondary)]">Time entry form coming soon.</p>
      </Card>
    </div>
  );
}
