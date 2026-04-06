import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Padding = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: string | ReactNode;
  padding?: Padding;
}

const paddings: Record<Padding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ header, padding = 'md', onClick, className, children, ...rest }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius-card)] border border-gray-100 shadow-[var(--shadow-card)]',
        'transition-shadow duration-150',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      {...rest}
    >
      {header && (
        <div className="border-b border-gray-100 px-4 py-3">
          {typeof header === 'string' ? (
            <h3 className="text-sm font-semibold text-[var(--color-text)]">{header}</h3>
          ) : header}
        </div>
      )}
      <div className={paddings[padding]}>{children}</div>
    </div>
  );
}
