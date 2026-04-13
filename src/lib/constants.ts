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
  FileText,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';

// ─── Colors (dark glass theme) ──────────────────────────────────────────────
export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active:     { bg: 'rgba(114, 59, 143, 0.20)', text: '#C084FC', dot: '#A855F7' },
  on_hold:    { bg: 'rgba(251, 191, 36, 0.15)', text: '#FCD34D', dot: '#FBBF24' },
  completed:  { bg: 'rgba(52, 211, 153, 0.15)', text: '#6EE7B7', dot: '#34D399' },
  cancelled:  { bg: 'rgba(248, 113, 113, 0.15)', text: '#FCA5A5', dot: '#F87171' },
  pending:    { bg: 'rgba(255, 255, 255, 0.06)', text: 'rgba(255,255,255,0.5)', dot: 'rgba(255,255,255,0.3)' },
  in_progress:{ bg: 'rgba(218, 46, 143, 0.18)', text: '#F9A8D4', dot: '#DA2E8F' },
  review:     { bg: 'rgba(251, 191, 36, 0.15)', text: '#FCD34D', dot: '#FBBF24' },
  blocked:    { bg: 'rgba(248, 113, 113, 0.15)', text: '#FCA5A5', dot: '#F87171' },
  draft:      { bg: 'rgba(255, 255, 255, 0.06)', text: 'rgba(255,255,255,0.5)', dot: 'rgba(255,255,255,0.3)' },
  submitted:  { bg: 'rgba(52, 211, 153, 0.15)', text: '#6EE7B7', dot: '#34D399' },
  approved:   { bg: 'rgba(52, 211, 153, 0.15)', text: '#6EE7B7', dot: '#34D399' },
  rejected:   { bg: 'rgba(248, 113, 113, 0.15)', text: '#FCA5A5', dot: '#F87171' },
  // Compatibility
  not_started: { bg: 'rgba(255, 255, 255, 0.06)', text: 'rgba(255,255,255,0.5)', dot: 'rgba(255,255,255,0.3)' },
  todo:        { bg: 'rgba(255, 255, 255, 0.06)', text: 'rgba(255,255,255,0.5)', dot: 'rgba(255,255,255,0.3)' },
  done:        { bg: 'rgba(52, 211, 153, 0.15)', text: '#6EE7B7', dot: '#34D399' },
  overdue:     { bg: 'rgba(248, 113, 113, 0.15)', text: '#FCA5A5', dot: '#F87171' },
  planning:    { bg: 'rgba(114, 59, 143, 0.18)', text: '#C084FC', dot: '#A855F7' },
};

export const PHASE_STATUS_COLORS = STATUS_COLORS;


export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low:      { bg: 'rgba(52, 211, 153, 0.15)', text: '#6EE7B7' },
  medium:   { bg: 'rgba(251, 191, 36, 0.15)', text: '#FCD34D' },
  high:     { bg: 'rgba(249, 115, 22, 0.18)', text: '#FDBA74' },
  critical: { bg: 'rgba(248, 113, 113, 0.18)', text: '#FCA5A5' },
  urgent:   { bg: 'rgba(248, 113, 113, 0.18)', text: '#FCA5A5' },
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

export const PROJECT_TYPES_LIST = [
  'Boardroom',
  'Conference Room',
  'Residential/HNI',
  'Experience Centre',
  'Auditorium',
  'Lighting/HVAC',
] as const;

export const PROJECT_TYPES = PROJECT_TYPES_LIST.map(t => ({ 
  value: t.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_'), 
  label: t 
}));


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
    { icon: ClipboardList,   label: "Today's Summary", path: '/summary' },
    { icon: FolderKanban,    label: 'Projects',     path: '/projects' },
    { icon: CheckSquare,     label: 'My Tasks',    path: '/tasks' },
    { icon: Clock,           label: 'Time Entry',  path: '/time' },
    { icon: Users,           label: 'Team',        path: '/team' },
    { icon: Settings,        label: 'Settings',   path: '/settings' },
  ],
  team_lead: [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
    { icon: ClipboardList,   label: "Today's Summary", path: '/summary' },
    { icon: FolderKanban,    label: 'Projects',     path: '/projects' },
    { icon: CheckSquare,     label: 'My Tasks',    path: '/tasks' },
    { icon: Clock,           label: 'Time Entry',  path: '/time' },
    { icon: Settings,        label: 'Settings',   path: '/settings' },
  ],
  field_staff: [
    { icon: ClipboardList,   label: "Today's Summary", path: '/summary' },
    { icon: CheckSquare,    label: 'My Tasks',   path: '/tasks' },
    { icon: Clock,         label: 'Time Entry', path: '/time' },
    { icon: Settings,       label: 'Settings',  path: '/settings' },
  ],
  hr: [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
    { icon: ClipboardList,   label: "Today's Summary", path: '/summary' },
    { icon: Users,           label: 'Team',        path: '/team' },
    { icon: Settings,        label: 'Settings',   path: '/settings' },
  ],
  project_manager: [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
    { icon: ClipboardList,   label: "Today's Summary", path: '/summary' },
    { icon: FolderKanban,    label: 'Projects',     path: '/projects' },
    { icon: CheckSquare,     label: 'My Tasks',    path: '/tasks' },
    { icon: Clock,           label: 'Time Entry',  path: '/time' },
    { icon: Settings,        label: 'Settings',   path: '/settings' },
  ],
  procurement_manager: [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
    { icon: ClipboardList,   label: "Today's Summary", path: '/summary' },
    { icon: TrendingUp,      label: 'Procurement', path: '/procurement' },
    { icon: CheckSquare,     label: 'My Tasks',    path: '/tasks' },
    { icon: Clock,           label: 'Time Entry',  path: '/time' },
    { icon: Settings,        label: 'Settings',   path: '/settings' },
  ],
  accounts: [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
    { icon: ClipboardList,   label: "Today's Summary", path: '/summary' },
    { icon: TrendingUp,      label: 'Accounts',    path: '/accounts' },
    { icon: Clock,           label: 'Time Entry',  path: '/time' },
    { icon: Settings,        label: 'Settings',   path: '/settings' },
  ],
  sales: [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/' },
    { icon: ClipboardList,   label: "Today's Summary", path: '/summary' },
    { icon: FolderKanban,    label: 'Projects',     path: '/projects' },
    { icon: CheckSquare,     label: 'My Tasks',    path: '/tasks' },
    { icon: Clock,           label: 'Time Entry',  path: '/time' },
    { icon: Settings,        label: 'Settings',   path: '/settings' },
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
  hr: 'HR',
  project_manager: 'Project Manager',
  procurement_manager: 'Procurement Manager',
  accounts: 'Accounts',
  sales: 'Sales',
};

export const TASK_PRIORITIES = [
  { value: 'high', label: 'High', color: '#D32F2F' },
  { value: 'medium', label: 'Medium', color: '#F57C00' },
  { value: 'low', label: 'Low', color: '#388E3C' },
] as const;

export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
] as const;



