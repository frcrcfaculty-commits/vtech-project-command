-- ============================================================
-- DB POLISH MIGRATION
-- V-Tech Project Command
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- ============================================================
-- TASK 1: Phase auto-date trigger
-- ============================================================
-- When project_phases.status changes:
--   to 'in_progress': set actual_start = CURRENT_DATE if NULL
--   to 'completed': set actual_end = CURRENT_DATE if NULL, AND ensure actual_start is set
--   changing back from 'completed' to anything else: clear actual_end

CREATE OR REPLACE FUNCTION trigger_phase_auto_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process on UPDATE, not INSERT
  IF TG_OP = 'UPDATE' THEN
    -- Transitioning TO 'in_progress'
    IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
      IF NEW.actual_start IS NULL THEN
        NEW.actual_start := CURRENT_DATE;
      END IF;
    END IF;

    -- Transitioning TO 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      -- Ensure actual_start is set (if not, set it now)
      IF NEW.actual_start IS NULL THEN
        NEW.actual_start := CURRENT_DATE;
      END IF;
      -- Set actual_end
      IF NEW.actual_end IS NULL THEN
        NEW.actual_end := CURRENT_DATE;
      END IF;
    END IF;

    -- Transitioning FROM 'completed' to anything else
    IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
      NEW.actual_end := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_phase_auto_dates ON project_phases;
CREATE TRIGGER trigger_phase_auto_dates
  BEFORE UPDATE ON project_phases
  FOR EACH ROW EXECUTE FUNCTION trigger_phase_auto_dates();

-- ============================================================
-- TASK 2: Milestone auto-status from tasks
-- ============================================================
-- When a task's status changes, recalculate the parent milestone's status:
--   If ALL tasks under the milestone are 'done' → milestone status = 'completed'
--   If ANY task is 'in_progress' AND not all done → milestone status = 'in_progress'
--   If milestone.due_date < CURRENT_DATE AND not completed → milestone status = 'overdue'
--   Otherwise → 'pending'

CREATE OR REPLACE FUNCTION recompute_milestone_status(p_milestone_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_tasks INT;
  v_done_tasks INT;
  v_in_progress_tasks INT;
  v_due_date DATE;
  v_new_status milestone_status;
BEGIN
  -- Get counts
  SELECT COUNT(*) INTO v_total_tasks
  FROM tasks
  WHERE milestone_id = p_milestone_id;

  SELECT COUNT(*) INTO v_done_tasks
  FROM tasks
  WHERE milestone_id = p_milestone_id AND status = 'done';

  SELECT COUNT(*) INTO v_in_progress_tasks
  FROM tasks
  WHERE milestone_id = p_milestone_id AND status = 'in_progress';

  SELECT due_date INTO v_due_date
  FROM milestones
  WHERE id = p_milestone_id;

  -- Determine new status
  IF v_total_tasks = 0 THEN
    -- No tasks: stay pending
    v_new_status := 'pending';
  ELSIF v_done_tasks = v_total_tasks THEN
    -- All done: completed
    v_new_status := 'completed';
  ELSIF v_in_progress_tasks > 0 AND v_done_tasks < v_total_tasks THEN
    -- Some in progress and not all done: in_progress
    v_new_status := 'in_progress';
  ELSIF v_due_date < CURRENT_DATE THEN
    -- Past due date and not completed: overdue
    v_new_status := 'overdue';
  ELSE
    -- Default: pending
    v_new_status := 'pending';
  END IF;

  -- Update milestone status
  UPDATE milestones
  SET status = v_new_status
  WHERE id = p_milestone_id
  AND status != v_new_status;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_task_milestone_status()
RETURNS TRIGGER AS $$
DECLARE
  v_milestone_id UUID;
BEGIN
  -- On INSERT: get milestone_id from NEW
  -- On UPDATE: use OLD.milestone_id in case it changed
  -- On DELETE: use OLD.milestone_id
  IF TG_OP = 'DELETE' THEN
    v_milestone_id := OLD.milestone_id;
  ELSE
    v_milestone_id := NEW.milestone_id;
  END IF;

  -- Recompute milestone status
  PERFORM recompute_milestone_status(v_milestone_id);

  -- Return appropriate row (ignored for AFTER triggers)
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_task_milestone_status ON tasks;
CREATE TRIGGER trigger_task_milestone_status
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION trigger_task_milestone_status();

-- ============================================================
-- TASK 3: Mark Project Complete RPC
-- ============================================================
-- Postgres function mark_project_complete(p_project_id UUID)
-- Verifies ALL 10 phases are 'completed', then marks project as completed with actual_end_date

CREATE OR REPLACE FUNCTION mark_project_complete(p_project_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  client_name TEXT,
  project_type project_type,
  city TEXT,
  status project_status,
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  created_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_incomplete_count INT;
  v_project_exists BOOLEAN;
BEGIN
  -- Verify project exists
  SELECT EXISTS(SELECT 1 FROM projects WHERE id = p_project_id)
  INTO v_project_exists;

  IF NOT v_project_exists THEN
    RAISE EXCEPTION 'Project not found: %', p_project_id;
  END IF;

  -- Count incomplete phases (not 'completed')
  SELECT COUNT(*)
  INTO v_incomplete_count
  FROM project_phases
  WHERE project_id = p_project_id
  AND status != 'completed';

  -- Raise exception if any phases are incomplete
  IF v_incomplete_count > 0 THEN
    RAISE EXCEPTION 'Cannot complete project: % phases not finished', v_incomplete_count;
  END IF;

  -- All phases complete: mark project as complete
  UPDATE projects
  SET
    status = 'completed'::project_status,
    actual_end_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_project_id;

  -- Return updated project
  RETURN QUERY
  SELECT
    projects.id,
    projects.name,
    projects.client_name,
    projects.project_type,
    projects.city,
    projects.status,
    projects.start_date,
    projects.target_end_date,
    projects.actual_end_date,
    projects.created_by,
    projects.notes,
    projects.created_at,
    projects.updated_at
  FROM projects
  WHERE projects.id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant EXECUTE to authenticated role
GRANT EXECUTE ON FUNCTION mark_project_complete(UUID) TO authenticated;

-- ============================================================
-- TASK 4: Daily snapshot table for trends
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_snapshots (
  snapshot_date DATE PRIMARY KEY,
  active_projects INT NOT NULL DEFAULT 0,
  total_work_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_travel_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  overdue_tasks INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to compute and record daily snapshot
-- Idempotent: running twice on same day overwrites, doesn't duplicate
CREATE OR REPLACE FUNCTION record_daily_snapshot()
RETURNS TABLE(
  snapshot_date DATE,
  active_projects INT,
  total_work_hours NUMERIC,
  total_travel_hours NUMERIC,
  overdue_tasks INT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_active_projects INT;
  v_total_work_hours NUMERIC;
  v_total_travel_hours NUMERIC;
  v_overdue_tasks INT;
BEGIN
  -- Count active projects (status = 'active')
  SELECT COUNT(*)
  INTO v_active_projects
  FROM projects
  WHERE status = 'active';

  -- Sum work hours from today's time entries
  SELECT COALESCE(SUM(work_hours), 0)
  INTO v_total_work_hours
  FROM time_entries
  WHERE entry_date = CURRENT_DATE;

  -- Sum travel hours from today's time entries
  SELECT COALESCE(SUM(travel_hours), 0)
  INTO v_total_travel_hours
  FROM time_entries
  WHERE entry_date = CURRENT_DATE;

  -- Count overdue tasks (past due_date and not 'done')
  SELECT COUNT(*)
  INTO v_overdue_tasks
  FROM tasks
  WHERE due_date < CURRENT_DATE
  AND status != 'done';

  -- Insert or update today's snapshot (idempotent)
  INSERT INTO daily_snapshots (
    snapshot_date,
    active_projects,
    total_work_hours,
    total_travel_hours,
    overdue_tasks,
    created_at
  ) VALUES (
    CURRENT_DATE,
    v_active_projects,
    v_total_work_hours,
    v_total_travel_hours,
    v_overdue_tasks,
    NOW()
  )
  ON CONFLICT (snapshot_date) DO UPDATE SET
    active_projects = EXCLUDED.active_projects,
    total_work_hours = EXCLUDED.total_work_hours,
    total_travel_hours = EXCLUDED.total_travel_hours,
    overdue_tasks = EXCLUDED.overdue_tasks,
    created_at = NOW();

  -- Return the snapshot
  RETURN QUERY
  SELECT
    daily_snapshots.snapshot_date,
    daily_snapshots.active_projects,
    daily_snapshots.total_work_hours,
    daily_snapshots.total_travel_hours,
    daily_snapshots.overdue_tasks,
    daily_snapshots.created_at
  FROM daily_snapshots
  WHERE snapshot_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Grant EXECUTE to authenticated role
GRANT EXECUTE ON FUNCTION record_daily_snapshot() TO authenticated;

-- ============================================================
-- VERIFICATION TEST BLOCK
-- ============================================================
-- Wrap in BEGIN...ROLLBACK to avoid polluting database

BEGIN;

-- Find a project and phase for testing
DO $$
DECLARE
  v_project_id UUID;
  v_phase_id UUID;
  v_phase_name phase_name;
  v_initial_status phase_status;
  v_actual_start_after_progress DATE;
  v_actual_end_after_complete DATE;
  v_snapshot_exists BOOLEAN;
  v_error_raised BOOLEAN := FALSE;
BEGIN
  -- Get first available project
  SELECT id INTO v_project_id
  FROM projects
  LIMIT 1;

  IF v_project_id IS NULL THEN
    RAISE NOTICE 'VERIFICATION: No projects found in database. Skipping tests.';
  ELSE
    -- Get a phase from that project
    SELECT id, phase_name, status
    INTO v_phase_id, v_phase_name, v_initial_status
    FROM project_phases
    WHERE project_id = v_project_id
    LIMIT 1;

    -- Test 1: Update phase to 'in_progress' and verify actual_start is set
    RAISE NOTICE '--- TEST 1: Phase auto-date on in_progress ---';
    UPDATE project_phases
    SET status = 'in_progress'
    WHERE id = v_phase_id;

    SELECT actual_start INTO v_actual_start_after_progress
    FROM project_phases
    WHERE id = v_phase_id;

    IF v_actual_start_after_progress = CURRENT_DATE THEN
      RAISE NOTICE 'TEST 1 PASSED: actual_start was auto-set to %', CURRENT_DATE;
    ELSE
      RAISE NOTICE 'TEST 1 FAILED: actual_start is %, expected %', v_actual_start_after_progress, CURRENT_DATE;
    END IF;

    -- Test 2: Update phase to 'completed' and verify actual_end is set
    RAISE NOTICE '--- TEST 2: Phase auto-date on completed ---';
    UPDATE project_phases
    SET status = 'completed'
    WHERE id = v_phase_id;

    SELECT actual_end INTO v_actual_end_after_complete
    FROM project_phases
    WHERE id = v_phase_id;

    IF v_actual_end_after_complete = CURRENT_DATE THEN
      RAISE NOTICE 'TEST 2 PASSED: actual_end was auto-set to %', CURRENT_DATE;
    ELSE
      RAISE NOTICE 'TEST 2 FAILED: actual_end is %, expected %', v_actual_end_after_complete, CURRENT_DATE;
    END IF;

    -- Test 3: Call record_daily_snapshot and verify row exists
    RAISE NOTICE '--- TEST 3: Daily snapshot recording ---';
    PERFORM record_daily_snapshot();

    SELECT EXISTS(
      SELECT 1 FROM daily_snapshots WHERE snapshot_date = CURRENT_DATE
    ) INTO v_snapshot_exists;

    IF v_snapshot_exists THEN
      RAISE NOTICE 'TEST 3 PASSED: daily_snapshots row exists for %', CURRENT_DATE;
    ELSE
      RAISE NOTICE 'TEST 3 FAILED: no daily_snapshots row for %', CURRENT_DATE;
    END IF;

    -- Test 4: Try to mark project complete with incomplete phases (should raise exception)
    RAISE NOTICE '--- TEST 4: mark_project_complete error handling ---';
    BEGIN
      PERFORM mark_project_complete(v_project_id);
      RAISE NOTICE 'TEST 4 FAILED: Expected exception but none was raised';
    EXCEPTION WHEN OTHERS THEN
      IF SQLERRM LIKE '%phases not finished%' THEN
        RAISE NOTICE 'TEST 4 PASSED: Expected exception raised: %', SQLERRM;
      ELSE
        RAISE NOTICE 'TEST 4 FAILED: Wrong exception: %', SQLERRM;
      END IF;
    END;

  END IF;
END $$;

-- Rollback all changes to keep database clean
ROLLBACK;

-- ============================================================
-- END OF DB POLISH MIGRATION
-- ============================================================
-- Summary of improvements:
-- 1. trigger_phase_auto_dates: Auto-sets actual_start/actual_end date fields
-- 2. Milestone auto-status logic: Recomputes milestone status based on child tasks
-- 3. mark_project_complete RPC: Safely marks a project as complete (SECURITY DEFINER)
-- 4. daily_snapshots table + record_daily_snapshot function: Captures KPI trends
-- ============================================================
