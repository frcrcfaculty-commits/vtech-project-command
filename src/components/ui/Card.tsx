import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Padding = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: string | ReactNode;
  padding?: Padding;
}

const paddings: Record<Padding, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ header, padding = 'md', onClick, className, children, ...rest }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-[var(--radius-card)] glass overflow-hidden',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:bg-[var(--color-surface-hover)] hover:shadow-glow',
        className
      )}
      {...rest}
    >
      {header && (
        <div className="border-b border-white/10 px-5 py-3.5">
          {typeof header === 'string' ? (
            <h3 className="text-sm font-semibold text-[var(--color-text)]">{header}</h3>
          ) : header}
        </div>
      )}
      <div className={paddings[padding]}>{children}</div>
    </div>
  );
}
