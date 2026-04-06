import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-[#1A1A2E] mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent resize-none',
            error && 'border-[#C62828] focus:ring-[#C62828]',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#C62828]">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
