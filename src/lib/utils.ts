import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInMinutes } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getStatusColor(status: string): { bg: string; text: string; dot: string } {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    active:     { bg: '#E3F2FD', text: '#1565C0', dot: '#1E88E5' },
    on_hold:    { bg: '#FFF3E0', text: '#E65100', dot: '#FF6F00' },
    completed:  { bg: '#E8F5E9', text: '#2E7D32', dot: '#2E7D32' },
    cancelled:  { bg: '#FFEBEE', text: '#C62828', dot: '#C62828' },
    pending:    { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' },
    in_progress:{ bg: '#E3F2FD', text: '#1565C0', dot: '#1E88E5' },
    review:     { bg: '#FFF8E1', text: '#F9A825', dot: '#F9A825' },
    blocked:    { bg: '#FFEBEE', text: '#C62828', dot: '#C62828' },
    draft:      { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' },
    submitted:  { bg: '#E8F5E9', text: '#2E7D32', dot: '#2E7D32' },
    approved:   { bg: '#E8F5E9', text: '#2E7D32', dot: '#2E7D32' },
    rejected:   { bg: '#FFEBEE', text: '#C62828', dot: '#C62828' },
  };
  return colors[status] ?? { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' };
}
