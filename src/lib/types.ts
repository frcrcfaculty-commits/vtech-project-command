// src/lib/types.ts — STRICT, matches DB schema EXACTLY

export type UserRole = 'owner' | 'team_lead' | 'field_staff';

export type ProjectType =
  | 'boardroom'
  | 'conference_room'
  | 'residential'
  | 'experience_centre'
  | 'auditorium'
  | 'lighting_hvac';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

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

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface ITeam {
  id: string;
  name: string;
  created_at: string;
}

export interface IUser {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  team_id: string | null;
  team?: ITeam;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface IProject {
  id: string;
  name: string;
  client_name: string;
  project_type: ProjectType;
  city: string;
  status: ProjectStatus;
  start_date: string;
  target_end_date: string;
  actual_end_date: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  project_phases?: IProjectPhase[];
}

export interface IProjectPhase {
  id: string;
  project_id: string;
  phase_name: PhaseName;
  phase_order: number;
  status: PhaseStatus;
  assigned_team_id: string | null;
  assigned_team?: ITeam;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  notes: string | null;
  created_at: string;
  milestones?: IMilestone[];
}

export interface IMilestone {
  id: string;
  phase_id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: MilestoneStatus;
  created_by: string | null;
  created_at: string;
  tasks?: ITask[];
  task_count?: number;
  tasks_done?: number;
}

export interface ITask {
  id: string;
  milestone_id: string;
  phase_id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  assignee?: IUser;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  project_name?: string;
  phase_name?: string;
  milestone_title?: string;
  assignee_name?: string;
  assignee_avatar?: string | null;
  assigner_name?: string;
}

export interface ITimeEntry {
  id: string;
  user_id: string;
  user?: IUser;
  project_id: string;
  project?: IProject;
  phase_id: string;
  phase?: IProjectPhase;
  task_id: string | null;
  task?: ITask;
  entry_date: string;
  work_hours: number;
  travel_hours: number;
  city: string;
  notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard aggregation types (computed, not from DB tables)
export interface IProjectSummary {
  project_id: string;
  project_name: string;
  client_name: string;
  status: ProjectStatus;
  project_type: ProjectType;
  city: string;
  start_date: string;
  target_end_date: string;
  days_elapsed: number;
  days_remaining: number;
  total_work_hours: number;
  total_travel_hours: number;
  current_phase: PhaseName | null;
  completion_percentage: number;
}

export interface ITeamPerformance {
  team_id: string;
  team_name: string;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  avg_completion_days: number;
  total_work_hours: number;
  total_travel_hours: number;
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

// Form input types
export interface ProjectFilters {
  status?: ProjectStatus;
  project_type?: ProjectType;
  city?: string;
  search?: string;
}

export interface CreateProjectData {
  name: string;
  client_name: string;
  project_type: ProjectType;
  city: string;
  start_date: string;
  target_end_date: string;
  notes?: string;
}
