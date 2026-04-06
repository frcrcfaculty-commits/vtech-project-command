import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Clock,
  Users,
  Settings,
  Monitor,
  Home,
  Sparkles,
  Theater,
  Lightbulb,
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
  // Compatibility
  not_started: { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' },
  todo:        { bg: '#F5F5F5', text: '#616161', dot: '#9E9E9E' },
  done:        { bg: '#E8F5E9', text: '#2E7D32', dot: '#2E7D32' },
  overdue:     { bg: '#FFEBEE', text: '#C62828', dot: '#C62828' },
};

export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low:      { bg: '#E8F5E9', text: '#2E7D32' },
  medium:   { bg: '#FFF8E1', text: '#F57F17' },
  high:     { bg: '#FFF3E0', text: '#E65100' },
  critical: { bg: '#FFEBEE', text: '#C62828' },
  urgent:   { bg: '#FFEBEE', text: '#C62828' },
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

export const TEAM_NAMES = TEAMS.map(t => t.name);

// ─── Project Types ─────────────────────────────────────────────────────────
export const PROJECT_TYPES_DETAILED = [
  { value: 'boardroom', label: 'Corporate Boardroom', icon: Monitor },
  { value: 'conference_room', label: 'Conference/Training Room', icon: Users },
  { value: 'residential', label: 'Residential/HNI Home', icon: Home },
  { value: 'experience_centre', label: 'Experience Centre/Showroom', icon: Sparkles },
  { value: 'auditorium', label: 'Auditorium/Large Venue', icon: Theater },
  { value: 'lighting_hvac', label: 'Office Lighting/HVAC', icon: Lightbulb },
] as const;

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
  { name: 'site_survey', label: 'Site Survey', order: 1, team_id: 'team_1', defaultTeam: 'Sales/BD' },
  { name: 'design', label: 'Design/Engineering', order: 2, team_id: 'team_2', defaultTeam: 'Design/Engineering' },
  { name: 'boq_quotation', label: 'BOQ & Quotation', order: 3, team_id: 'team_2', defaultTeam: 'Design/Engineering' },
  { name: 'client_approval', label: 'Client Approval', order: 4, team_id: 'team_1', defaultTeam: 'Sales/BD' },
  { name: 'procurement', label: 'Procurement', order: 5, team_id: 'team_3', defaultTeam: 'Procurement' },
  { name: 'installation', label: 'Installation/Wiring', order: 6, team_id: 'team_4', defaultTeam: 'Installation' },
  { name: 'programming', label: 'Programming/Commissioning', order: 7, team_id: 'team_5', defaultTeam: 'Programming' },
  { name: 'testing', label: 'Testing/QA', order: 8, team_id: 'team_5', defaultTeam: 'Programming' },
  { name: 'handover', label: 'Handover', order: 9, team_id: 'team_1', defaultTeam: 'Sales/BD' },
  { name: 'amc_support', label: 'AMC/Support', order: 10, team_id: 'team_6', defaultTeam: 'Service/AMC' },
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

// ─── Validation & Limits ──────────────────────────────────────────────────
export const VALIDATION = {
  project_name_min: 3,
  project_name_max: 100,
  task_title_min: 3,
  task_title_max: 200,
  time_entry_max_hours: 24,
  time_entry_max_travel: 12,
} as const;

export const MAX_WORK_HOURS_PER_DAY = 16;
export const MAX_TRAVEL_HOURS_PER_DAY = 8;
export const MAX_TOTAL_HOURS_PER_DAY = 16;
export const HOUR_INCREMENT = 0.5;
export const MAX_BACKDATE_DAYS = 7;
export const SUSPICIOUS_WORK_HOURS = 10;
export const SUSPICIOUS_TRAVEL_HOURS = 4;
export const NO_ENTRY_ALERT_HOUR = 18; // 6 PM

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  team_lead: 'Team Lead',
  field_staff: 'Field Staff',
};
