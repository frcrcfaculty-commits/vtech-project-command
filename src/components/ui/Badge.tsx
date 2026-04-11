import { STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BadgeProps {
  status?: string;
  variant?: string; // Alias for status
  label?: string;
  children?: React.ReactNode; // Alias for label
  className?: string;
}

export function Badge({ status, variant, label, children, className }: BadgeProps) {
  const activeStatus = variant || status || 'pending';
  const activeLabel = children || label || activeStatus;

  const colors = STATUS_COLORS[activeStatus] ?? { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.6)', dot: 'rgba(255,255,255,0.3)' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        'backdrop-blur-sm border border-white/5',
        className
      )}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
      {activeLabel}
    </span>
  );
}
