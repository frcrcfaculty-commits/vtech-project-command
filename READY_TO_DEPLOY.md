# Supabase Upload - Ready to Deploy ✓

**Status:** All files ready for upload  
**Version:** v1.0.0-pilot (release/v1 branch)  
**Date:** April 8, 2026  

---

## 🎯 QUICK START

### Option 1: Manual Upload (No Code Needed - 5 minutes)

```bash
# Terminal 1: Copy the SQL
npm run export:db-polish

# Then in Supabase:
# 1. Go to: https://app.supabase.com
# 2. Select your project
# 3. Click: SQL Editor
# 4. New Query
# 5. Paste the SQL output above
# 6. Click: RUN
```

**Result:** 426 lines of SQL executed, 4 database improvements live

### Option 2: Automated Upload (Requires Service Role Key)

```bash
# Setup (one-time)
cat >> .env << 'EOF'
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase
EOF

# Deploy
npm run deploy:supabase:polish
```

**Where to get Service Role Key:**
- Supabase Dashboard → Settings → API → "service_role" secret

---

## 📦 WHAT'S UPLOADING

**Migration File:** `sql/db_polish.sql` (426 lines, 12.88 KB)

**Includes 4 Database Features:**

1. **Phase Auto-Date Trigger** (trigger_phase_auto_dates)
   - Auto-sets `actual_start` when phase → "in_progress"
   - Auto-sets `actual_end` when phase → "completed"

2. **Milestone Auto-Status** (trigger_task_milestone_status)
   - Updates milestone status based on task completion
   - Recalculates when tasks change

3. **Project Complete RPC** (mark_project_complete)
   - Finalizes a project with one function call
   - Validates no pending phases exist

4. **Daily Snapshots** (record_daily_snapshot)
   - Tracks KPI metrics daily
   - Idempotent (safe to run multiple times)

---

## 🛠️ NEW: NPM Commands for Upload

```bash
# Export SQL for manual upload (copy-paste)
npm run export:db-polish

# Export to file
npm run export:db-polish:file

# Verify Supabase connection
npm run verify:supabase

# Interactive deployment menu
npm run deploy:supabase

# Direct deployment (requires service role key)
npm run deploy:supabase:polish
```

---

## 📋 VERIFICATION AFTER UPLOAD

After executing the SQL in Supabase, run these queries to verify:

### Check Triggers Created:
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```
Expected: 2 rows
- `trigger_phase_auto_dates` → `project_phases`
- `trigger_task_milestone_status` → `tasks`

### Check Functions Created:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND routine_name IN ('mark_project_complete', 'recompute_milestone_status', 'record_daily_snapshot')
ORDER BY routine_name;
```
Expected: 3 rows (all functions present)

### Check Table Created:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'daily_snapshots';
```
Expected: 1 row

---

## 📁 FILES IN THIS DEPLOYMENT

### SQL Migration
- `sql/db_polish.sql` — The 426-line migration (on release/v1 branch)

### Documentation
- `UPLOAD_TO_SUPABASE.md` — Complete step-by-step guide
- `SUPABASE_SETUP_INSTRUCTIONS.md` — Setup guide with screenshots
- `DEPLOYMENT_SUMMARY.md` — Full deployment context

### Automation Scripts
- `scripts/export-db-polish.js` — ✨ NEW: Export helper
- `scripts/deploy-to-supabase.js` — Node.js automation (requires key)
- `scripts/verify-supabase.js` — Connection verification

### NPM Scripts (in package.json)
- `npm run export:db-polish` — ✨ NEW
- `npm run export:db-polish:file` — ✨ NEW
- `npm run deploy:supabase` — Interactive menu
- `npm run deploy:supabase:polish` — Direct deploy
- `npm run verify:supabase` — Test connection

---

## 🔐 SECURITY NOTES

- **Service Role Key:** Only store in `.env` (never commit)
- **Anon Key:** Already in `.env`, safe for frontend
- **SQL Editor:** Direct uploads don't require keys (you're logged in via Supabase dashboard)

---

## ✅ NEXT STEPS

### To Deploy Now (Manual Method):
1. `npm run export:db-polish` in terminal
2. Copy all the SQL output
3. Go to https://app.supabase.com → SQL Editor
4. New Query → Paste → Run

### To Deploy Later (Automated):
1. Get Service Role Key from Supabase Settings
2. Add to `.env`: `SUPABASE_SERVICE_ROLE_KEY=...`
3. Run: `npm run deploy:supabase:polish`

---

## 🆘 HELP & TROUBLESHOOTING

**Error: "Role public has no permissions"**
- Using Anon Key instead of Service Role Key
- Automated method requires Service Role Key only

**Error: "Relation already exists"**
- Migration already ran
- It's idempotent, safe to re-run

**Functions/Triggers not visible**
- Refresh browser
- Run the verification queries above

**Questions?**
- See: `UPLOAD_TO_SUPABASE.md` (complete guide)
- Contact: hansal@antigravity.dev

---

## 📊 WHAT HAPPENS NOW

✅ **Complete:**
- db_polish.sql created (426 lines)
- On GitHub release/v1 branch
- All 4 features tested
- Tagged v1.0.0-pilot
- Export helper created (**NEW**)
- npm commands configured

⏳ **Pending User Action:**
- Choose upload method (manual or automated)
- Execute the migration in Supabase
- Verify with test queries

🎯 **Result:**
- 4 database features live in Supabase
- Phase tracking automated
- Milestone updates automated
- Project completion workflow available
- Daily KPI snapshots recording

---

**Last Updated:** April 8, 2026  
**Version:** v1.0.0-pilot  
**Ready to Deploy:** YES ✓
