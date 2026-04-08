# SUPABASE UPLOAD - FINAL INSTRUCTIONS

**Status:** READY TO UPLOAD ✅  
**Date:** April 8, 2026  
**Project:** V-Tech Project Command  
**Version:** v1.0.0-pilot (release/v1)

---

## 🎯 UPLOAD NOW (Copy-Paste Method)

This is the fastest way to get db_polish.sql into your Supabase database.

### Step 1: Copy the Migration SQL

Run this command to display the SQL:
```bash
npm run export:db-polish
```

The output will be a 426-line SQL migration. **Select all and copy (Cmd+C or Ctrl+A then Cmd+C).**

### Step 2: Go to Supabase Dashboard

1. Open: https://app.supabase.com
2. Log in with your account
3. Select project: **vtech-project-command** (or your project name)
4. In left sidebar, click: **SQL Editor**
5. Click blue button: **New Query**

### Step 3: Paste and Execute

1. Delete any existing template SQL
2. Paste your copied SQL (Cmd+V or Ctrl+V)
3. Click the blue **RUN** button at top right
4. Wait for success message (should say "Query executed successfully")

### Step 4: Verify Success

In the same SQL Editor, run these verification queries:

**Query 1: Check Triggers**
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema='public' 
AND event_object_table IN ('project_phases', 'tasks')
ORDER BY trigger_name;
```
**Expected result:** 2 rows
- `trigger_phase_auto_dates` → `project_phases`
- `trigger_task_milestone_status` → `tasks`

**Query 2: Check Functions**
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema='public'
AND routine_name IN ('mark_project_complete', 'recompute_milestone_status', 'record_daily_snapshot')
ORDER BY routine_name;
```
**Expected result:** 3 rows (all functions listed)

**Query 3: Check Table**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema='public' 
AND table_name='daily_snapshots';
```
**Expected result:** 1 row = `daily_snapshots`

---

## 📊 WHAT YOU'RE UPLOADING

**File:** sql/db_polish.sql (426 lines, 12.88 KB)  
**Branch:** release/v1  
**Tag:** v1.0.0-pilot

### 4 Database Features:

| # | Feature | Type | What it does |
|---|---------|------|------------|
| 1 | Phase Auto-Dates | Trigger | Auto-sets `actual_start`/`actual_end` when phase status changes |
| 2 | Milestone Auto-Status | Trigger | Updates milestone status when tasks are modified |
| 3 | mark_project_complete() | RPC Function | Completes a project with validation (SECURITY DEFINER) |
| 4 | Daily Snapshots | Table + Function | Records KPI metrics daily (idempotent utility) |

---

## 🆘 IF SOMETHING GOES WRONG

### Error: "relation 'X' already exists"
- **Cause:** The migration has already been run
- **Solution:** That's normal! The SQL is idempotent (safe to run again)
- **No action needed:** Your database already has these features

### Error: "permission denied for schema public"
- **Cause:** User doesn't have permission (shouldn't happen in your own project)
- **Solution:** Make sure you're logged into the correct Supabase account

### Functions don't show up in DB Functions list
- **Cause:** It may take a few seconds to refresh
- **Solution:** Refresh the page or click on another page then back

### "Error: syntax error in SQL"
- **Cause:** The SQL was corrupted during copy
- **Solution:** Try again - make sure to select ALL the SQL output before copying

---

## ✅ AFTER SUCCESSFUL UPLOAD

Once all 3 verification queries pass:

1. ✅ Phase tracking is now automated
2. ✅ Milestones update automatically when tasks change
3. ✅ Project completion workflow is available
4. ✅ Daily snapshots start recording metrics
5. ✅ Use `mark_project_complete(project_uuid)` to finalize projects

### Next: Use the Features

**In your app code, you can now:**

```typescript
// Complete a project (triggers mark_project_complete function)
const { data, error } = await supabase
  .rpc('mark_project_complete', { project_id: '...' });

// Check daily snapshots
const { data: snapshots } = await supabase
  .from('daily_snapshots')
  .select('*')
  .eq('project_id', '...');

// Triggers handle the rest automatically:
// - Phase dates update when status changes
// - Milestones update when tasks change
// - Daily snapshots record at scheduled times
```

---

## 📁 DEPLOYMENT ARTIFACTS CREATED

### Automation Scripts
- ✅ `scripts/export-db-polish.js` — Export helper (ready to use)
- ✅ `scripts/deploy-to-supabase.js` — Automated deployment (requires service role key)
- ✅ `scripts/verify-supabase.js` — Connection verification

### NPM Commands
- ✅ `npm run export:db-polish` — Show SQL for copy-paste
- ✅ `npm run export:db-polish:file` — Save to file
- ✅ `npm run deploy:supabase:polish` — Automated (needs service key)
- ✅ `npm run verify:supabase` — Test connection

### Documentation
- ✅ UPLOAD_QUICK_REF.md — 30-second cheat sheet
- ✅ READY_TO_DEPLOY.md — Full deployment info
- ✅ UPLOAD_TO_SUPABASE.md — Detailed step-by-step guide
- ✅ SUPABASE_SETUP_INSTRUCTIONS.md — Setup details
- ✅ SUPABASE_UPLOAD_FINAL_INSTRUCTIONS.md — This file

### Database Migration
- ✅ `sql/db_polish.sql` — 426-line migration (committed to GitHub)

---

## 🤖 IF YOU WANT AUTOMATED DEPLOYMENT LATER

If you want to use `npm run deploy:supabase:polish` in the future:

1. Get your **Service Role Key** from Supabase:
   - Dashboard → Settings → API → "service_role" secret key
2. Add to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```
3. Run: `npm run deploy:supabase:polish`

⚠️ **Keep this key SECRET - never commit to git**

---

## 📞 SUPPORT

**Questions about this deployment?**
- See: UPLOAD_QUICK_REF.md
- See: READY_TO_DEPLOY.md
- See: UPLOAD_TO_SUPABASE.md

**Questions about Supabase?**
- Docs: https://supabase.com/docs
- Dashboard: https://app.supabase.com

**Contact:** hansal@antigravity.dev

---

## ✨ EVERYTHING IS READY

All code is committed to GitHub (release/v1 branch).  
All scripts work and are tested.  
All documentation is complete.  

**Next step:** Run `npm run export:db-polish` and paste into Supabase SQL Editor → click RUN

---

**Version:** v1.0.0-pilot  
**Ready to Upload:** YES ✅  
**Time to Deploy:** ~5 minutes  
