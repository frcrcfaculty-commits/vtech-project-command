# Upload db_polish.sql to Supabase - Step by Step

## ⚡ FASTEST METHOD (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://app.supabase.com
2. Select your project: **V-Tech Project Command**
3. Click on **SQL Editor** (left sidebar)

### Step 2: Create New Query
- Click **New Query** or **+** button
- Delete the default template

### Step 3: Copy the Migration
1. Open your terminal and copy the entire migration:
   ```bash
   cat sql/db_polish.sql
   ```
   Or copy from file: `vtech-project-command/sql/db_polish.sql`

2. Select ALL the SQL text (Cmd+A)
3. Copy to clipboard (Cmd+C)

### Step 4: Paste into Supabase
1. Click in the SQL Editor text area
2. Paste (Cmd+V)
3. You should see a 426-line SQL migration

### Step 5: Execute
1. Click the blue **RUN** button (top right)
2. Wait for success message ✓

### Step 6: Verify the Migration Worked

#### Verify Triggers Created
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```
Expected: 2 triggers
- `trigger_phase_auto_dates` on `project_phases`
- `trigger_task_milestone_status` on `tasks`

#### Verify Functions Created
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('recompute_milestone_status', 'mark_project_complete', 'record_daily_snapshot')
ORDER BY routine_name;
```
Expected: 3 functions
- `mark_project_complete`
- `recompute_milestone_status`
- `record_daily_snapshot`

#### Verify Table Created
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'daily_snapshots';
```
Expected: 1 row with `daily_snapshots`

---

## 🤖 AUTOMATED METHOD (requires service role key)

If you prefer automation:

### Step 1: Get Your Service Role Key
1. In Supabase Dashboard: **Settings → API**
2. Under "Project API keys", find **Service Role Key**
3. Copy it (⚠️ Keep this secret - don't commit to git)

### Step 2: Add to .env
Edit `.env` in your project root:

```env
VITE_SUPABASE_URL=https://ksdqvauhsiwgbuiywvft.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz
ZSIsInJlZiI6ImtzZHF2YXVoc2l3Z2J1aXl3dmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Nzkx
NTUsImV4cCI6MjA5MTA1NTE1NX0.4j-xSbzHQuSVspbVtmilaFXgUvh96NxGYM11-4EP_2Q
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
```

### Step 3: Run Deployment
```bash
npm run deploy:supabase:polish
```

Or with menu:
```bash
npm run deploy:supabase
```

---

## 📋 WHAT db_polish.sql CONTAINS

This 426-line migration includes:

### 1. Phase Auto-Date Trigger
- Automatically sets `actual_start` when phase status → "in_progress"
- Automatically sets `actual_end` when phase status → "completed"
- Clears `actual_end` if phase reverts from "completed"

### 2. Milestone Auto-Status Trigger
- Automatically updates milestone status based on task completion
- Runs on INSERT, UPDATE, DELETE of tasks
- Recalculates all affected milestones

### 3. mark_project_complete() RPC Function
- Finalizes a project with SECURITY DEFINER
- Updates project status to "completed"
- Records completion timestamp
- Validates project has no pending phases

### 4. Daily Snapshots for KPI Tracking
- Creates `daily_snapshots` table
- `record_daily_snapshot()` function (idempotent)
- Tracks project progress metrics daily

---

## 🆘 TROUBLESHOOTING

### Error: "permission denied for schema public"
- Make sure you're using the **Service Role Key**, not the Anon Key
- Service Role Key has admin permissions

### Error: "relation already exists"
- The migration has already been run
- No action needed - it's idempotent

### Triggers/Functions not showing up
- Refresh the Supabase dashboard
- Check the verification queries above

### Need to rollback?
- Contact Hansal or Antigravity admin
- Or manually delete: triggers, functions, and `daily_snapshots` table

---

## ✅ COMPLETION CHECKLIST

After uploading, verify:

- [ ] All SQL executed without errors
- [ ] 2 triggers created (on project_phases, tasks)
- [ ] 3 functions created (mark_project_complete, recompute_milestone_status, record_daily_snapshot)
- [ ] 1 table created (daily_snapshots)
- [ ] No permission errors
- [ ] .env with service role key not committed to git

---

## 📞 NEED HELP?

- Supabase Docs: https://supabase.com/docs
- Project Dashboard: https://app.supabase.com
- Contact: hansal@antigravity.dev

