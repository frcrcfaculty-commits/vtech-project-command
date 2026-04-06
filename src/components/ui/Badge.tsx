import { STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BadgeProps {
  status: string;
  label: string;
  className?: string;
}

export function Badge({ status, label, className }: BadgeProps) {
  const colors = STATUS_COLORS[status] ?? { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' };
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
      {label}
    </span>
  );
}
