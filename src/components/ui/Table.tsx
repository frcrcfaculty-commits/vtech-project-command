import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

interface TableProps<T extends { id?: string }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T extends { id?: string }>({ columns, data, onRowClick, className }: TableProps<T>) {
  return (
    <div className="w-full">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className={cn('w-full text-sm', className)}>
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide', col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id ?? JSON.stringify(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-white/5 last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-white/5 transition-colors'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-[var(--color-text)]">
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((row) => (
          <div
            key={row.id ?? JSON.stringify(row)}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'rounded-[var(--radius-card)] glass p-4',
              onRowClick && 'cursor-pointer hover:bg-[var(--color-surface-hover)] transition-all'
            )}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">{col.label}</span>
                <span className="text-sm text-[var(--color-text)]">
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
