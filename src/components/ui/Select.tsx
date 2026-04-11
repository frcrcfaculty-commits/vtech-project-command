import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option { value: string; label: string }

interface SelectProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label, options, value, onChange, placeholder, error, required, disabled, className,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}{required && <span className="text-[var(--color-danger)] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          className={cn(
            'h-11 w-full appearance-none rounded-[var(--radius-input)] px-4 pr-10 text-sm text-[var(--color-text)]',
            'glass-input cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/50 focus:border-white/25',
            'transition-all duration-200',
            error ? 'border-[var(--color-danger)]' : 'hover:border-white/20 hover:bg-white/8',
            disabled && 'opacity-40 cursor-not-allowed',
            !value && 'text-[var(--color-text-secondary)]',
            className
          )}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
