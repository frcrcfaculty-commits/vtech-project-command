-- ============================================================
-- FIX: RLS Infinite Recursion on project_phases
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Create a SECURITY DEFINER helper function
-- This bypasses RLS when checking team assignment, breaking the recursion loop
CREATE OR REPLACE FUNCTION user_team_has_project_access(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_phases
    WHERE project_id = p_project_id
    AND assigned_team_id = get_user_team_id()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 2: Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "phases_team_read" ON project_phases;
DROP POLICY IF EXISTS "projects_team_read" ON projects;

-- Step 3: Recreate projects policy using the helper (no recursion)
CREATE POLICY "projects_team_read" ON projects FOR SELECT USING (
  user_team_has_project_access(id)
);

-- Step 4: Recreate project_phases policy using the helper (no recursion)
CREATE POLICY "phases_team_read" ON project_phases FOR SELECT USING (
  assigned_team_id = get_user_team_id()
  OR user_team_has_project_access(project_id)
);

-- Step 5: Also fix milestones_team_read which references project_phases and 
-- could hit the same recursion via cascading RLS
DROP POLICY IF EXISTS "milestones_team_read" ON milestones;
CREATE POLICY "milestones_team_read" ON milestones FOR SELECT USING (
  user_team_has_project_access(project_id)
);

-- ============================================================
-- DONE! All RLS recursion issues are now fixed.
-- The app should load correctly after running this.
-- ============================================================
