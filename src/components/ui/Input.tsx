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
    <div className="flex flex-col gap-1">
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
            'h-10 w-full rounded-[var(--radius-input)] border bg-white px-3 text-sm text-[var(--color-text)]',
            'placeholder:text-[var(--color-text-secondary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent',
            'transition-colors duration-150',
            error
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
              : 'border-gray-200 hover:border-gray-300',
            isPassword && 'pr-10',
            className
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
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
