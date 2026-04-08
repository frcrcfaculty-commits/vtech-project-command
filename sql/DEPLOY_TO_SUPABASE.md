# Step 10: Deploy to Supabase

This guide walks you through deploying V-Tech Project Command (release/v1) to Supabase.

## DEPLOY TO SUPABASE

### Prerequisites
- Supabase project created at https://supabase.com
- Have your Supabase `anon key` and `service_role key` ready
- Access to Supabase SQL Editor with admin privileges

### Deployment Sequence

#### 1. Create/Reset Database (if starting fresh)
- Go to **Supabase Dashboard → SQL Editor**
- Run `schema.sql` (FROM: `sql/schema.sql`)
  - This creates all tables, enums, views, and RLS policies
  - Safe to run multiple times; uses `IF NOT EXISTS`

#### 2. Run DB Polish Migration
- In Supabase SQL Editor, run `db_polish.sql` (FROM: `sql/db_polish.sql`)
- This adds:
  - Phase auto-date trigger (task_status auto-updates)
  - Milestone auto-status trigger
  - `mark_project_complete(p_project_id UUID)` RPC function
  - `daily_snapshots` table
  - `record_daily_snapshot()` function (idempotent)
- Verify: Check `sql/db_polish.sql` in the repo for BEGIN...ROLLBACK test block output

#### 3. Load Seed Data (Optional, for demo)
Run these IN ORDER in Supabase SQL Editor:

a) **Realistic Seed Data**
   - File: `sql/seed_realistic.sql`
   - Creates: 2 seed projects, 5 teams, 10+ users, 20+ tasks/milestones
   - Inserts with realistic dates and task status distributions

b) **Create Auth Users**
   - File: `sql/create_auth_users.js` (Node.js file)
   - Requires: `@supabase/supabase-js` installed locally
   - Usage:
     ```bash
     npm install @supabase/supabase-js
     node sql/create_auth_users.js
     ```
   - Expected: Creates 5 auth users with Supabase Auth
   - Environment variables needed:
     ```
     SUPABASE_URL=https://YOUR_PROJECT.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

#### 4. Configure Frontend Environment Variables
- Copy `.env.example` to `.env.local`
- Fill in:
  ```
  VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```

#### 5. Test Frontend Connection
```bash
npm install
npm run dev
```
- Should compile without errors
- Dashboard should load (may show empty state if no seed data)

---

## SMOKE TEST CHECKLIST

Run these tests IN ORDER to validate the deployment:

### Test 1: Database Connection
- [ ] Login page loads without errors
- [ ] Open browser DevTools → Network tab
- [ ] Click Login → Check for Supabase calls (should succeed)

### Test 2: Authentication
- [ ] Login with seed user (email: `owner@vtech.com`, password: from `create_auth_users.js` output)
- [ ] Session persists on page refresh
- [ ] Logout clears session

### Test 3: Dashboard Load
- [ ] After login, dashboard loads
- [ ] Cards showing: "Active Projects", "Team Performance", "Phase Bottleneck"
- [ ] Charts render (no console errors)

### Test 4: Phase Auto-Date Trigger
- [ ] Go to Projects → Select a project
- [ ] Edit a phase status to "in_progress"
- [ ] Verify: `actual_start` is set to TODAY
- [ ] Edit phase status to "completed"
- [ ] Verify: `actual_end` is set to TODAY

### Test 5: Milestone Auto-Status
- [ ] Go to Milestones list
- [ ] Edit ALL tasks under a milestone to "done"
- [ ] Verify: Milestone status auto-updates to "completed"
- [ ] Change 1 task back to "in_progress"
- [ ] Verify: Milestone status reverts to "in_progress"

### Test 6: Mark Project Complete RPC
- [ ] Go to Projects → Select a project with all phases completed
- [ ] Look for "Mark Complete" button (or console test)
- [ ] Click → Project status changes to "completed"
- [ ] Try on incomplete project → Shows error: "Cannot complete project: X phases not finished"

### Test 7: Daily Snapshots (Manual Check)
- [ ] In Supabase SQL Editor, run:
  ```sql
  SELECT record_daily_snapshot();
  SELECT * FROM daily_snapshots ORDER BY snapshot_date DESC LIMIT 1;
  ```
- [ ] Verify: Snapshot created with active_projects count, work hours, travel hours, overdue tasks

### Test 8: Mobile Responsiveness
- [ ] Open in mobile view (375px width)
- [ ] Sidebar collapses → hamburger menu appears
- [ ] Navigation works
- [ ] Forms are readable

### Test 9: Time Entry Module
- [ ] Go to Time Entry page
- [ ] Add time entry for today
- [ ] Verify: Entry appears in daily summary
- [ ] Copy yesterday's entries → Should populate tasks from yesterday

### Test 10: Realtime Updates (Optional)
- [ ] Open app in 2 browser tabs
- [ ] In Tab 1, edit a task status
- [ ] Tab 2 should update in real-time (if using Supabase realtime subscriptions)

---

## Rollback Procedure (If Issues)

If deployment fails or tests don't pass:

1. **Identify the problematic migration:**
   - Check Supabase SQL Editor error logs
   - Test section has errors → RUN THE TEST BLOCK AGAIN (it's wrapped in BEGIN...ROLLBACK, safe to retry)

2. **Rollback to clean state:**
   - Drop all tables (WARNING: Data loss):
     ```sql
     DROP SCHEMA public CASCADE;
     CREATE SCHEMA public;
     ```
   - Re-run `schema.sql` only
   - Re-run `db_polish.sql` with fixes if needed

3. **Contact DevOps:**
   - If stuck on Supabase configuration issues
   - Check Supabase docs: https://supabase.com/docs/guides/database/overview

---

## Deployment Complete ✅

Once all smoke tests pass:
1. Notify team of live deployment
2. Share login credentials securely (NOT in chat)
3. Monitor Supabase Dashboard for errors (Logs tab)
4. Ready for beta/production rollout

