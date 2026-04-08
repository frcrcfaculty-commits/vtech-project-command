# DB Polish Migration Guide

## Overview
This migration file (`db_polish.sql`) contains 4 critical database improvements for V-Tech Project Command.

## Prerequisites
- Run `schema.sql` first to establish base tables and enums
- Run this file AFTER `schema.sql` in Supabase SQL Editor

## What Gets Created

### 1. Phase Auto-Dates (BEFORE UPDATE Trigger)
**Function**: `trigger_phase_auto_dates()`
**Trigger**: `trigger_phase_auto_dates` on `project_phases`

Automatically sets actual_start and actual_end dates:
- When status → 'in_progress': Sets actual_start = TODAY (if NULL)
- When status → 'completed': Sets both actual_start and actual_end = TODAY (if NULL)
- When status ← 'completed' (reverting): Clears actual_end

**Does NOT fire on INSERT** - only UPDATE operations

### 2. Milestone Auto-Status (AFTER INSERT/UPDATE/DELETE Trigger)
**Functions**: 
- `recompute_milestone_status(p_milestone_id UUID)` - Core logic
- `trigger_task_milestone_status()` - Trigger function

**Trigger**: `trigger_task_milestone_status` on `tasks`

Automatically recomputes milestone status when tasks change:
- All tasks 'done' → milestone status = 'completed'
- Any task 'in_progress' AND not all done → 'in_progress'
- Due date passed AND not completed → 'overdue'
- Zero tasks or default → 'pending'

Fires on INSERT, UPDATE, DELETE of tasks

### 3. Mark Project Complete RPC
**Function**: `mark_project_complete(p_project_id UUID)` (SECURITY DEFINER)

Safely marks project as complete with validation:
- Verifies ALL 10 phases have status = 'completed'
- Raises exception if any phases incomplete: "Cannot complete project: X phases not finished"
- Sets projects.status = 'completed'
- Sets projects.actual_end_date = CURRENT_DATE
- Returns updated project row

**Frontend Usage**:
```typescript
const { data, error } = await supabase.rpc('mark_project_complete', { 
  p_project_id: projectId 
});
```

**Permissions**: SECURITY DEFINER, EXECUTE granted to authenticated role

### 4. Daily Snapshots KPI Table
**Table**: `daily_snapshots`
**Function**: `record_daily_snapshot()`

Captures daily KPI metrics:
- snapshot_date (DATE, PRIMARY KEY)
- active_projects (count of projects with status = 'active')
- total_work_hours (sum from today's time_entries.work_hours)
- total_travel_hours (sum from today's time_entries.travel_hours)
- overdue_tasks (count of tasks past due_date and not 'done')
- created_at (TIMESTAMPTZ)

**Idempotent**: Running twice on same day overwrites row, doesn't duplicate

**Usage**: Call manually (or set up pg_cron for automation)
```sql
SELECT record_daily_snapshot();
```

## Testing
The file includes a verification test block (wrapped in BEGIN...ROLLBACK):
1. Updates a phase to 'in_progress' and verifies actual_start is auto-set
2. Updates phase to 'completed' and verifies actual_end is auto-set
3. Calls record_daily_snapshot() and verifies row exists
4. Attempts mark_project_complete() on incomplete project (expects exception)

All changes rollback, so database remains clean.

## Deployment Steps
1. In Supabase SQL Editor, run `schema.sql` first (if not already run)
2. Copy and run `db_polish.sql`
3. All 4 features become active immediately
4. No frontend changes needed for features 1, 2, 4
5. For feature 3, wire up a "Mark Project Complete" button with supabase.rpc() call

## Verification
After running the SQL:
```sql
-- Verify triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE 'trigger_%';

-- Verify functions exist
SELECT proname FROM pg_proc 
WHERE proname IN ('trigger_phase_auto_dates', 'recompute_milestone_status', 
                  'mark_project_complete', 'record_daily_snapshot');

-- Verify table exists
SELECT * FROM daily_snapshots;
```

## Database Objects Created (8 total)
1. `trigger_phase_auto_dates()` function
2. `trigger_phase_auto_dates` trigger
3. `recompute_milestone_status()` function
4. `trigger_task_milestone_status()` function
5. `trigger_task_milestone_status` trigger
6. `mark_project_complete()` function (RPC)
7. `daily_snapshots` table
8. `record_daily_snapshot()` function

## Notes
- All functions use PL/pgSQL for PostgreSQL compatibility
- Triggers handle edge cases (zero tasks, phase reversions, etc.)
- mark_project_complete validates 10 phase completion requirement
- daily_snapshots uses ON CONFLICT for idempotent updates
- Security: SECURITY DEFINER used only on mark_project_complete where appropriate

## Support
If any function fails to create, check that schema.sql was run first and all required types/tables exist.
