import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays, isAfter, isBefore, parseISO, differenceInMinutes } from 'date-fns';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get initials from a name (max 2 chars)
 */
export function initials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Date Formatting
 */
export function formatDate(date: string | Date, fmt = 'dd MMM yyyy'): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateShort(date: string | Date): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM');
}

export function formatTimeAgo(date: string | Date): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function daysFromNow(date: string | Date): number {
  if (!date) return 0;
  const target = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(target, new Date());
}

export function isOverdue(date: string | Date): boolean {
  if (!date) return false;
  const target = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(target, new Date());
}

/**
 * Number & Hour Formatting
 */
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0 && m === 0) return '0h';
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function roundToHalf(num: number): number {
  return Math.round(num * 2) / 2;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Status & Health
 */
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
    // Compatibility
    not_started: { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' },
    todo:        { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' },
    done:        { bg: '#E8F5E9', text: '#2E7D32', dot: '#2E7D32' },
    overdue:     { bg: '#FFEBEE', text: '#C62828', dot: '#C62828' },
  };
  return colors[status] ?? { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' };
}

export function calculateCompletion(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * String Utilities
 */
export function truncate(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
