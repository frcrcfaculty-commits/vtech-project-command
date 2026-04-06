// ============================================================
// V-TECH PROJECT COMMAND — SHARED TYPES
// ============================================================

export type UserRole = 'owner' | 'team_lead' | 'field_staff';

export type ProjectType =
  | 'boardroom'
  | 'conference_room'
  | 'residential'
  | 'experience_centre'
  | 'auditorium'
  | 'lighting_hvac';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export type PhaseName =
  | 'site_survey'
  | 'design'
  | 'boq_quotation'
  | 'client_approval'
  | 'procurement'
  | 'installation'
  | 'programming'
  | 'testing'
  | 'handover'
  | 'amc_support';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'review' | 'pending';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type TimeEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface ITeam {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  full_name?: string; // Compatibility with A4
  phone?: string;
  role: UserRole;
  team_id: string;
  team_name?: string;
  team?: ITeam;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface IProject {
  id: string;
  name: string;
  client_name: string;
  project_type: ProjectType | string;
  status: ProjectStatus;
  priority?: TaskPriority | string;
  city: string;
  state?: string;
  address?: string;
  owner_id?: string;
  created_by?: string;
  start_date?: string;
  target_end_date?: string;
  actual_end_date?: string | null;
  end_date?: string;
  budget?: number;
  description?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  project_phases?: IProjectPhase[];
}

export interface IProjectPhase {
  id: string;
  project_id: string;
  phase_name: PhaseName | string;
  phase_order?: number;
  phase_number?: number; // Alias for phase_order

  status: PhaseStatus | ProjectStatus;
  assigned_team_id?: string | null;
  assigned_team?: ITeam;
  team_id?: string;
  team_name?: string; // Alias for assigned team name
  planned_start?: string | null;
  planned_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  start_date?: string;
  end_date?: string;
  notes?: string | null;
  created_at: string;
  milestones?: IMilestone[];
  task_count?: number; // Alias
  tasks_total?: number; // Alias
  tasks_done?: number; // Alias
  tasks_completed?: number; // Alias
}




export interface IMilestone {
  id: string;
  project_id: string;
  phase_id?: string;
  title: string;
  description?: string | null;
  status: MilestoneStatus | TaskStatus;
  due_date?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  tasks?: ITask[];
  task_count?: number; // Alias
  tasks_done?: number; // Alias
}


export interface ITask {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus | string;
  priority: TaskPriority | string;
  project_id: string;
  project_name?: string;
  phase_id?: string;
  phase_name?: string;
  milestone_id?: string;
  assigned_to?: string;

  assigned_to_name?: string;
  assigned_by?: string;
  assigner_name?: string; // Alias for assigned_by_name
  assignee_name?: string; // Alias for assigned_to_name
  assignee?: IUser;

  due_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}


export interface ITimeEntry {
  id: string;
  user_id: string;
  user?: IUser;

  users?: IUser; // Plural alias for some joins
  project_id: string;
  project?: IProject;
  projects?: IProject; // Plural alias for some joins
  phase_id?: string;
  phase?: IProjectPhase;
  project_phases?: IProjectPhase; // Alias for phase join
  task_id?: string | null;
  task?: ITask;
  work_hours: number;
  travel_hours: number;
  city: string;
  date?: string;
  entry_date?: string;
  description?: string;
  notes?: string | null;
  status?: TimeEntryStatus;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;

  project_name?: string;
  phase_name?: string;
  task_title?: string;
}

export interface IProjectSummary {
  project_id: string;
  project_name?: string;
  name?: string;
  client_name: string;
  status: ProjectStatus;
  project_type?: ProjectType;
  city: string;
  start_date?: string;
  target_end_date?: string;
  days_elapsed?: number;
  days_remaining?: number;
  total_work_hours?: number;
  total_travel_hours?: number;
  total_hours?: number;
  current_phase?: PhaseName | string | null;
  completion_percentage?: number;
  progress_pct?: number;
  tasks_completed?: number;
  tasks_total?: number;
}

export interface ITeamPerformance {
  team_id: string;
  team_name: string;
  total_hours?: number;
  total_work_hours?: number;
  total_travel_hours?: number;
  projects_active?: number;
  tasks_completed?: number;
  completed_tasks?: number;
  total_tasks?: number;
  overdue_tasks?: number;
  avg_completion_days?: number;
  members?: number;
}

export interface IDailyUserHours {
  user_id: string;
  full_name: string;
  team_id: string;
  team_name: string;
  entry_date: string;
  work_hours: number;
  travel_hours: number;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  project_type?: string;
  city?: string;
  search?: string;
}

export interface CreateProjectData {
  name: string;
  client_name: string;
  project_type: string;
  city: string;
  start_date: string;
  target_end_date: string;
  description?: string;
  notes?: string;
}
