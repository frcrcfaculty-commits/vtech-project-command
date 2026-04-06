import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:   'bg-[var(--color-primary)] text-white hover:bg-[#0a1729] border border-transparent',
  secondary: 'bg-[var(--color-secondary)] text-white hover:bg-[#1976D2] border border-transparent',
  outline:   'bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[#0B1F3F]/5',
  danger:    'bg-[var(--color-danger)] text-white hover:bg-[#B71C1C] border border-transparent',
  ghost:     'bg-transparent text-[var(--color-text)] hover:bg-gray-100 border border-transparent',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-[var(--radius-btn)]',
  md: 'h-10 px-4 text-sm rounded-[var(--radius-btn)]',
  lg: 'h-12 px-6 text-base rounded-[var(--radius-btn)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}
