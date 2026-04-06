// ============================================================
// V-TECH PROJECT COMMAND — SHARED CONSTANTS
// ALL agents import from this file. DO NOT hardcode strings.
// ============================================================

export const PHASE_CONFIG = [
  { name: 'site_survey', label: 'Site Survey', order: 1, defaultTeam: 'Sales/BD', icon: 'MapPin' },
  { name: 'design', label: 'Design/Engineering', order: 2, defaultTeam: 'Design/Engineering', icon: 'Pencil' },
  { name: 'boq_quotation', label: 'BOQ & Quotation', order: 3, defaultTeam: 'Design/Engineering', icon: 'FileSpreadsheet' },
  { name: 'client_approval', label: 'Client Approval', order: 4, defaultTeam: 'Sales/BD', icon: 'CheckCircle' },
  { name: 'procurement', label: 'Procurement', order: 5, defaultTeam: 'Procurement', icon: 'ShoppingCart' },
  { name: 'installation', label: 'Installation/Wiring', order: 6, defaultTeam: 'Installation', icon: 'Wrench' },
  { name: 'programming', label: 'Programming/Commissioning', order: 7, defaultTeam: 'Programming', icon: 'Code' },
  { name: 'testing', label: 'Testing/QA', order: 8, defaultTeam: 'Programming', icon: 'FlaskConical' },
  { name: 'handover', label: 'Handover', order: 9, defaultTeam: 'Sales/BD', icon: 'PackageCheck' },
  { name: 'amc_support', label: 'AMC/Support', order: 10, defaultTeam: 'Service/AMC', icon: 'Headphones' },
] as const;

export const PROJECT_TYPES = [
  { value: 'boardroom', label: 'Corporate Boardroom', icon: 'Monitor' },
  { value: 'conference_room', label: 'Conference/Training Room', icon: 'Users' },
  { value: 'residential', label: 'Residential/HNI Home', icon: 'Home' },
  { value: 'experience_centre', label: 'Experience Centre/Showroom', icon: 'Sparkles' },
  { value: 'auditorium', label: 'Auditorium/Large Venue', icon: 'Theater' },
  { value: 'lighting_hvac', label: 'Office Lighting/HVAC', icon: 'Lightbulb' },
] as const;

export const TEAM_NAMES = [
  'Sales/BD',
  'Design/Engineering',
  'Procurement',
  'Installation',
  'Programming',
  'Service/AMC',
  'Admin',
 ] as const;

export const STATUS_COLORS: Record<string, string> = {
  // Project status
  planning: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  // Phase status
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  blocked: 'bg-red-100 text-red-700',
  // Task status
  todo: 'bg-gray-100 text-gray-600',
  done: 'bg-green-100 text-green-700',
  // Milestone status
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export const PRIORITY_ICONS: Record<string, string> = {
  low: 'ArrowDown',
  medium: 'ArrowRight',
  high: 'ArrowUp',
  urgent: 'AlertTriangle',
};

export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Gurgaon', 'Noida', 'Chandigarh', 'Indore', 'Nagpur',
  'Kochi', 'Goa', 'Vizag', 'Surat', 'Vadodara',
  'Bhopal', 'Coimbatore', 'Thiruvananthapuram', 'Mangalore',
  'Other',
] as const;

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

export const NAV_ITEMS = {
  owner: [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/projects', label: 'Projects', icon: 'FolderKanban' },
    { path: '/time', label: 'Time Logs', icon: 'Clock' },
    { path: '/team', label: 'Teams', icon: 'Users' },
    { path: '/settings', label: 'Settings', icon: 'Settings' },
  ],
  team_lead: [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/projects', label: 'Projects', icon: 'FolderKanban' },
    { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
    { path: '/time', label: 'Time Logs', icon: 'Clock' },
    { path: '/settings', label: 'Settings', icon: 'Settings' },
  ],
  field_staff: [
    { path: '/tasks', label: 'My Tasks', icon: 'CheckSquare' },
    { path: '/time', label: 'Log Time', icon: 'Clock' },
    { path: '/projects', label: 'Projects', icon: 'FolderKanban' },
    { path: '/settings', label: 'Profile', icon: 'Settings' },
  ],
} as const;
