# UPLOAD TO SUPABASE - QUICK REFERENCE

## 🚀 30-SECOND VERSION

**To upload db_polish.sql to Supabase right now:**

```bash
# In terminal:
npm run export:db-polish

# Then in browser:
# 1. Go to: https://app.supabase.com
# 2. Click SQL Editor
# 3. New Query
# 4. Paste the SQL from terminal
# 5. Click RUN
```

**Done.** All 4 database features now live.

---

## 📊 WHAT GETS UPLOADED

| Feature | Type | Tables/Functions |
|---------|------|-----------------|
| Phase auto-dates | Trigger | `trigger_phase_auto_dates` on `project_phases` |
| Milestone auto-status | Trigger | `trigger_task_milestone_status` on `tasks` |
| Project complete | RPC | `mark_project_complete(uuid)` function |
| Daily snapshots | Table + Function | `daily_snapshots` table, `record_daily_snapshot()` function |

**Total SQL:** 426 lines, 12.88 KB

---

## ✅ VERIFY IT WORKED

In Supabase SQL Editor, run:

```sql
-- Check triggers
SELECT COUNT(*) as trigger_count FROM information_schema.triggers 
WHERE trigger_schema='public' AND event_object_table IN ('project_phases','tasks');

-- Check functions  
SELECT COUNT(*) as function_count FROM information_schema.routines
WHERE routine_schema='public' AND routine_name IN ('mark_project_complete','recompute_milestone_status','record_daily_snapshot');

-- Check table
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_schema='public' AND table_name='daily_snapshots';
```

**Expected:** 2, 3, 1 (all success)

---

## 🛠️ ALL UPLOAD OPTIONS

| Option | Command | Notes |
|--------|---------|-------|
| **Manual** | `npm run export:db-polish` | Copy-paste to Supabase, no auth needed |
| **Auto** | `npm run deploy:supabase:polish` | Requires Service Role Key in .env |
| **Interactive** | `npm run deploy:supabase` | Menu with all options |
| **Test** | `npm run verify:supabase` | Test Supabase connection |
| **File Export** | `npm run export:db-polish:file` | Save to db-polish-export.sql |

---

## 🔑 IF USING AUTOMATED UPLOAD

1. Get Service Role Key from Supabase: Settings → API
2. Add to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```
3. Run: `npm run deploy:supabase:polish`

---

## 📍 DEPLOYMENT STATUS

- ✅ db_polish.sql ready (426 lines)
- ✅ On GitHub release/v1 branch  
- ✅ Export helper script ready
- ✅ npm commands configured
- ✅ Documentation complete
- ⏳ **Awaiting user action:** Choose upload method & execute

---

## 📚 FULL GUIDES

- [READY_TO_DEPLOY.md](READY_TO_DEPLOY.md) — Complete deployment info
- [UPLOAD_TO_SUPABASE.md](UPLOAD_TO_SUPABASE.md) — Step-by-step with verification
- [SUPABASE_SETUP_INSTRUCTIONS.md](SUPABASE_SETUP_INSTRUCTIONS.md) — Setup details

---

**Version:** v1.0.0-pilot | **Branch:** release/v1 | **Tag:** v1.0.0-pilot | **Date:** Apr 8, 2026
