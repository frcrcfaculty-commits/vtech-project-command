import { type ButtonHTMLAttributes, type ReactNode } from 'react';
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
  primary:   'btn-gradient font-semibold',
  secondary: 'bg-white/10 text-white border border-white/15 hover:bg-white/15 hover:border-white/25 backdrop-blur-sm',
  outline:   'bg-transparent text-[var(--color-text)] border border-white/20 hover:bg-white/8 hover:border-white/30',
  danger:    'bg-[var(--color-danger)] text-white hover:brightness-110 border border-transparent shadow-[0_2px_12px_rgba(248,113,113,0.3)]',
  ghost:     'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-white/8 border border-transparent',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-[var(--radius-btn)]',
  md: 'h-11 px-5 text-sm rounded-[var(--radius-btn)]',
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
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed',
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
