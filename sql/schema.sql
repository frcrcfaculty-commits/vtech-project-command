-- ============================================================
-- V-TECH PROJECT COMMAND — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor in order
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('owner', 'team_lead', 'field_staff');
CREATE TYPE project_type AS ENUM ('boardroom', 'conference_room', 'residential', 'experience_centre', 'auditorium', 'lighting_hvac');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE phase_status AS ENUM ('not_started', 'in_progress', 'completed', 'blocked');
CREATE TYPE phase_name AS ENUM ('site_survey', 'design', 'boq_quotation', 'client_approval', 'procurement', 'installation', 'programming', 'testing', 'handover', 'amc_support');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Teams
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'field_staff',
  team_id UUID REFERENCES teams(id),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  project_type project_type NOT NULL,
  city TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'planning',
  start_date DATE NOT NULL,
  target_end_date DATE NOT NULL,
  actual_end_date DATE,
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (target_end_date >= start_date)
);

-- Project Phases (auto-generated per project)
CREATE TABLE project_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_name phase_name NOT NULL,
  phase_order INT NOT NULL,
  status phase_status NOT NULL DEFAULT 'not_started',
  assigned_team_id UUID REFERENCES teams(id),
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, phase_name)
);

-- Milestones
CREATE TABLE milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_id UUID NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status milestone_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Entries
CREATE TABLE time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  phase_id UUID NOT NULL REFERENCES project_phases(id),
  task_id UUID REFERENCES tasks(id),
  entry_date DATE NOT NULL,
  work_hours NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (work_hours >= 0 AND work_hours <= 16),
  travel_hours NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (travel_hours >= 0 AND travel_hours <= 8),
  city TEXT NOT NULL,
  notes TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_hours CHECK (work_hours + travel_hours > 0)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_project_phases_project ON project_phases(project_id);
CREATE INDEX idx_milestones_phase ON milestones(phase_id);
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_date ON time_entries(entry_date);
CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, entry_date);

-- ============================================================
-- 4. AUTO-UPDATE TIMESTAMPS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_projects_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_tasks_updated
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_time_entries_updated
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. AUTO-GENERATE PHASES ON PROJECT CREATE
-- ============================================================

CREATE OR REPLACE FUNCTION auto_create_project_phases()
RETURNS TRIGGER AS $$
DECLARE
  team_map JSONB := '{
    "site_survey": "Sales/BD",
    "design": "Design/Engineering",
    "boq_quotation": "Design/Engineering",
    "client_approval": "Sales/BD",
    "procurement": "Procurement",
    "installation": "Installation",
    "programming": "Programming",
    "testing": "Programming",
    "handover": "Sales/BD",
    "amc_support": "Service/AMC"
  }'::JSONB;
  phase_record RECORD;
  target_team_id UUID;
  phase_order_val INT := 1;
BEGIN
  FOR phase_record IN
    SELECT unnest(ARRAY[
      'site_survey', 'design', 'boq_quotation', 'client_approval',
      'procurement', 'installation', 'programming', 'testing',
      'handover', 'amc_support'
    ]::phase_name[]) AS pname
  LOOP
    SELECT id INTO target_team_id
    FROM teams
    WHERE name = team_map->>phase_record.pname::text;

    INSERT INTO project_phases (project_id, phase_name, phase_order, assigned_team_id)
    VALUES (NEW.id, phase_record.pname, phase_order_val, target_team_id);

    phase_order_val := phase_order_val + 1;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_phases
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION auto_create_project_phases();

-- ============================================================
-- 6. AUTO-SET task completed_at
-- ============================================================

CREATE OR REPLACE FUNCTION auto_task_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_task_completed
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION auto_task_completed();

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's team_id
CREATE OR REPLACE FUNCTION get_user_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- TEAMS: everyone can read, owner can write
CREATE POLICY "teams_read" ON teams FOR SELECT USING (true);
CREATE POLICY "teams_write" ON teams FOR ALL USING (get_user_role() = 'owner');

-- USERS: everyone can read active users, owner can manage
CREATE POLICY "users_read" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (get_user_role() = 'owner');
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_update_owner" ON users FOR UPDATE USING (get_user_role() = 'owner');

-- PROJECTS: owner sees all, team_lead/field_staff see projects their team is on
CREATE POLICY "projects_owner_all" ON projects FOR ALL USING (get_user_role() = 'owner');
CREATE POLICY "projects_team_read" ON projects FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_phases pp
    WHERE pp.project_id = projects.id
    AND pp.assigned_team_id = get_user_team_id()
  )
);

-- PROJECT_PHASES: same as projects
CREATE POLICY "phases_owner_all" ON project_phases FOR ALL USING (get_user_role() = 'owner');
CREATE POLICY "phases_team_read" ON project_phases FOR SELECT USING (
  assigned_team_id = get_user_team_id()
  OR EXISTS (
    SELECT 1 FROM project_phases pp2
    WHERE pp2.project_id = project_phases.project_id
    AND pp2.assigned_team_id = get_user_team_id()
  )
);
CREATE POLICY "phases_lead_update" ON project_phases FOR UPDATE USING (
  get_user_role() = 'team_lead' AND assigned_team_id = get_user_team_id()
);

-- MILESTONES: owner full access, team members read
CREATE POLICY "milestones_owner_all" ON milestones FOR ALL USING (get_user_role() = 'owner');
CREATE POLICY "milestones_team_read" ON milestones FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_phases pp
    WHERE pp.id = milestones.phase_id
    AND pp.assigned_team_id = get_user_team_id()
  )
);
CREATE POLICY "milestones_lead_write" ON milestones FOR INSERT WITH CHECK (
  get_user_role() = 'team_lead'
);
CREATE POLICY "milestones_lead_update" ON milestones FOR UPDATE USING (
  get_user_role() = 'team_lead'
);

-- TASKS: owner sees all, assigned user sees own, team lead sees team's
CREATE POLICY "tasks_owner_all" ON tasks FOR ALL USING (get_user_role() = 'owner');
CREATE POLICY "tasks_assigned_read" ON tasks FOR SELECT USING (assigned_to = auth.uid());
CREATE POLICY "tasks_lead_all" ON tasks FOR ALL USING (
  get_user_role() = 'team_lead'
  AND EXISTS (
    SELECT 1 FROM users u WHERE u.id = tasks.assigned_to AND u.team_id = get_user_team_id()
  )
);
CREATE POLICY "tasks_staff_update" ON tasks FOR UPDATE USING (
  assigned_to = auth.uid()
  AND get_user_role() = 'field_staff'
);

-- TIME_ENTRIES: users manage own, leads see/verify team's, owner sees all
CREATE POLICY "time_owner_all" ON time_entries FOR ALL USING (get_user_role() = 'owner');
CREATE POLICY "time_own_read" ON time_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "time_own_insert" ON time_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "time_own_update" ON time_entries FOR UPDATE USING (
  user_id = auth.uid() AND verified_by IS NULL
);
CREATE POLICY "time_own_delete" ON time_entries FOR DELETE USING (
  user_id = auth.uid() AND verified_by IS NULL
);
CREATE POLICY "time_lead_read" ON time_entries FOR SELECT USING (
  get_user_role() = 'team_lead'
  AND EXISTS (
    SELECT 1 FROM users u WHERE u.id = time_entries.user_id AND u.team_id = get_user_team_id()
  )
);
CREATE POLICY "time_lead_verify" ON time_entries FOR UPDATE USING (
  get_user_role() = 'team_lead'
  AND EXISTS (
    SELECT 1 FROM users u WHERE u.id = time_entries.user_id AND u.team_id = get_user_team_id()
  )
);

-- ============================================================
-- 8. ANALYTICS VIEWS (for dashboard queries)
-- ============================================================

-- Project summary with hours
CREATE OR REPLACE VIEW project_summary AS
SELECT
  p.id AS project_id,
  p.name AS project_name,
  p.client_name,
  p.status,
  p.project_type,
  p.city,
  p.start_date,
  p.target_end_date,
  (CURRENT_DATE - p.start_date) AS days_elapsed,
  (p.target_end_date - CURRENT_DATE) AS days_remaining,
  COALESCE(SUM(te.work_hours), 0) AS total_work_hours,
  COALESCE(SUM(te.travel_hours), 0) AS total_travel_hours,
  (SELECT pp.phase_name FROM project_phases pp
   WHERE pp.project_id = p.id AND pp.status = 'in_progress'
   ORDER BY pp.phase_order LIMIT 1) AS current_phase,
  (SELECT COUNT(*) FROM project_phases pp
   WHERE pp.project_id = p.id AND pp.status = 'completed')::FLOAT / 10 * 100
   AS completion_percentage
FROM projects p
LEFT JOIN time_entries te ON te.project_id = p.id
GROUP BY p.id;

-- Team performance
CREATE OR REPLACE VIEW team_performance AS
SELECT
  t.id AS team_id,
  t.name AS team_name,
  COUNT(DISTINCT tk.id) AS total_tasks,
  COUNT(DISTINCT tk.id) FILTER (WHERE tk.status = 'done') AS completed_tasks,
  COUNT(DISTINCT tk.id) FILTER (WHERE tk.due_date < CURRENT_DATE AND tk.status != 'done') AS overdue_tasks,
  COALESCE(SUM(te.work_hours), 0) AS total_work_hours,
  COALESCE(SUM(te.travel_hours), 0) AS total_travel_hours,
  CASE
    WHEN COUNT(DISTINCT tk.id) FILTER (WHERE tk.status = 'done') > 0
    THEN AVG(EXTRACT(DAY FROM (tk.completed_at - tk.created_at))) FILTER (WHERE tk.status = 'done')
    ELSE 0
  END AS avg_completion_days
FROM teams t
LEFT JOIN users u ON u.team_id = t.id
LEFT JOIN tasks tk ON tk.assigned_to = u.id
LEFT JOIN time_entries te ON te.user_id = u.id
GROUP BY t.id;

-- Daily hours per user (for no-entry alerts)
CREATE OR REPLACE VIEW daily_user_hours AS
SELECT
  u.id AS user_id,
  u.full_name,
  u.team_id,
  t.name AS team_name,
  te.entry_date,
  COALESCE(SUM(te.work_hours), 0) AS work_hours,
  COALESCE(SUM(te.travel_hours), 0) AS travel_hours
FROM users u
LEFT JOIN time_entries te ON te.user_id = u.id
LEFT JOIN teams t ON t.id = u.team_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.full_name, u.team_id, t.name, te.entry_date;

-- ============================================================
-- 9. SEED DATA
-- ============================================================

-- Insert teams
INSERT INTO teams (name) VALUES
  ('Sales/BD'),
  ('Design/Engineering'),
  ('Procurement'),
  ('Installation'),
  ('Programming'),
  ('Service/AMC'),
  ('Admin');
