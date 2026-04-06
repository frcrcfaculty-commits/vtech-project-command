import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Clock,
  Users,
  Settings,
  ChevronRight,
} from 'lucide-react';

// ─── Colors ────────────────────────────────────────────────────────────────
export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
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

export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low:      { bg: '#E8F5E9', text: '#2E7D32' },
  medium:   { bg: '#FFF8E1', text: '#F57F17' },
  high:     { bg: '#FFF3E0', text: '#E65100' },
  critical: { bg: '#FFEBEE', text: '#C62828' },
};

// ─── Teams ─────────────────────────────────────────────────────────────────
export const TEAMS = [
  { id: 'team_1', name: 'Sales/BD' },
  { id: 'team_2', name: 'Design/Engineering' },
  { id: 'team_3', name: 'Procurement' },
  { id: 'team_4', name: 'Installation' },
  { id: 'team_5', name: 'Programming' },
  { id: 'team_6', name: 'Service/AMC' },
  { id: 'team_7', name: 'Admin' },
] as const;

// ─── Project Types ─────────────────────────────────────────────────────────
export const PROJECT_TYPES = [
  'Boardroom',
  'Conference Room',
  'Residential/HNI',
  'Experience Centre',
  'Auditorium',
  'Lighting/HVAC',
] as const;

// ─── 10 Phases ─────────────────────────────────────────────────────────────
export const PHASE_CONFIG = [
  { order: 1,  name: 'Site Survey',             team_id: 'team_1' },
  { order: 2,  name: 'Design/Engineering',       team_id: 'team_2' },
  { order: 3,  name: 'BOQ & Quotation',          team_id: 'team_2' },
  { order: 4,  name: 'Client Approval',          team_id: 'team_1' },
  { order: 5,  name: 'Procurement',              team_id: 'team_3' },
  { order: 6,  name: 'Installation/Wiring',      team_id: 'team_4' },
  { order: 7,  name: 'Programming/Commissioning',team_id: 'team_5' },
  { order: 8,  name: 'Testing/QA',               team_id: 'team_5' },
  { order: 9,  name: 'Handover',                 team_id: 'team_1' },
  { order: 10, name: 'AMC/Support',              team_id: 'team_6' },
] as const;

// ─── Indian Cities ─────────────────────────────────────────────────────────
export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata',
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Surat', 'Kochi', 'Goa', 'Indore',
  'Nagpur', 'Coimbatore', 'Bhubaneswar', 'Ranchi', 'Vizag',
] as const;

// ─── Navigation ─────────────────────────────────────────────────────────────
type NavItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

export const NAV_ITEMS: Record<string, NavItem[]> = {
  owner: [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
    { icon: FolderKanban,    label: 'Projects',     path: '/projects' },
    { icon: CheckSquare,     label: 'My Tasks',    path: '/tasks' },
    { icon: Clock,           label: 'Time Entry',  path: '/time' },
    { icon: Users,           label: 'Team',        path: '/team' },
    { icon: Settings,        label: 'Settings',   path: '/settings' },
  ],
  team_lead: [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
    { icon: FolderKanban,    label: 'Projects',     path: '/projects' },
    { icon: CheckSquare,     label: 'My Tasks',    path: '/tasks' },
    { icon: Clock,           label: 'Time Entry',  path: '/time' },
    { icon: Settings,        label: 'Settings',   path: '/settings' },
  ],
  field_staff: [
    { icon: CheckSquare,    label: 'My Tasks',   path: '/tasks' },
    { icon: Clock,         label: 'Time Entry', path: '/time' },
    { icon: Settings,       label: 'Settings',  path: '/settings' },
  ],
};

// ─── Validation ─────────────────────────────────────────────────────────────
export const VALIDATION = {
  project_name_min: 3,
  project_name_max: 100,
  task_title_min: 3,
  task_title_max: 200,
  time_entry_max_hours: 24,
  time_entry_max_travel: 12,
} as const;
