import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, subtitle, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon size={24} className="text-[var(--color-text-secondary)]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-xs">{subtitle}</p>}
      {action && (
        <Button variant="secondary" size="md" onClick={action.onClick} icon={Icon}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
