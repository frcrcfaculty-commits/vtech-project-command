import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md text-center p-8">
        <h1 className="text-6xl font-bold text-[var(--color-secondary)] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">Page Not Found</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
      </Card>
    </div>
  );
}
