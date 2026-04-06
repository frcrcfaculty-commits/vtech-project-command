import { format, formatDistanceToNow, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';
import { PhaseName } from './types';
import { STATUS_COLORS, PHASE_CONFIG } from './constants';

// ============================================================
// DATE UTILITIES
// ============================================================

export function formatDate(date: string | Date): string {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy');
}

export function formatDateShort(date: string | Date): string {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM');
}

export function formatTimeAgo(date: string | Date): string {
  return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true });
}

export function daysFromNow(date: string | Date): number {
  const target = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(target, new Date());
}

export function isOverdue(date: string | Date): boolean {
  const target = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(target, new Date());
}

export function isWithinDays(date: string | Date, days: number): boolean {
  const target = typeof date === 'string' ? parseISO(date) : date;
  const future = new Date();
  future.setDate(future.getDate() + days);
  return isAfter(target, new Date()) && isBefore(target, future);
}

// ============================================================
// STATUS UTILITIES
// ============================================================

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
}

export function getPhaseLabel(phaseName: PhaseName): string {
  return PHASE_CONFIG.find(p => p.name === phaseName)?.label || phaseName;
}

export function getPhaseIcon(phaseName: PhaseName): string {
  return PHASE_CONFIG.find(p => p.name === phaseName)?.icon || 'Circle';
}

// ============================================================
// NUMBER UTILITIES
// ============================================================

export function formatHours(hours: number): string {
  if (hours === 0) return '0h';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
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

// ============================================================
// PERCENTAGE & PROGRESS
// ============================================================

export function calculateCompletion(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getHealthColor(percentage: number, daysElapsedRatio: number): string {
  // If progress is ahead of time, green
  if (percentage >= daysElapsedRatio * 100) return 'text-green-600';
  // If slightly behind, yellow
  if (percentage >= daysElapsedRatio * 70) return 'text-yellow-600';
  // Significantly behind, red
  return 'text-red-600';
}

// ============================================================
// STRING UTILITIES
// ============================================================

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ============================================================
// CLASSNAME UTILITY (simple cn function)
// ============================================================

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
