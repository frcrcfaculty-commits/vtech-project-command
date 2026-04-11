import { type InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, type, className, required, ...rest }: InputProps) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPwd ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}{required && <span className="text-[var(--color-danger)] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          required={required}
          className={cn(
            'h-11 w-full rounded-[var(--radius-input)] px-4 text-sm text-[var(--color-text)]',
            'glass-input',
            'placeholder:text-[var(--color-text-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/50 focus:border-white/25',
            'transition-all duration-200',
            error
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/40'
              : 'hover:border-white/20 hover:bg-white/8',
            isPassword && 'pr-10',
            className
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      {helperText && !error && <p className="text-xs text-[var(--color-text-secondary)]">{helperText}</p>}
    </div>
  );
}
