export type UserRole = 'owner' | 'team_lead' | 'field_staff';

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';

export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type TimeEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  team_id: string;
  team_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ITeam {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface IProject {
  id: string;
  name: string;
  client_name: string;
  project_type: string;
  status: ProjectStatus;
  priority: Priority;
  city: string;
  state: string;
  address?: string;
  owner_id: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface IProjectPhase {
  id: string;
  project_id: string;
  phase_name: string;
  phase_order: number;
  status: ProjectStatus;
  team_id?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface IMilestone {
  id: string;
  project_id: string;
  phase_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ITask {
  id: string;
  project_id: string;
  phase_id?: string;
  milestone_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ITimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  phase_id?: string;
  task_id?: string;
  work_hours: number;
  travel_hours: number;
  city: string;
  date: string;
  description?: string;
  status: TimeEntryStatus;
  created_at: string;
  updated_at: string;
  project_name?: string;
  phase_name?: string;
  task_title?: string;
}

export interface IProjectSummary {
  id: string;
  name: string;
  client_name: string;
  status: ProjectStatus;
  city: string;
  total_hours: number;
  tasks_completed: number;
  tasks_total: number;
  progress_pct: number;
}

export interface ITeamPerformance {
  team_id: string;
  team_name: string;
  total_hours: number;
  projects_active: number;
  tasks_completed: number;
  members: number;
}
