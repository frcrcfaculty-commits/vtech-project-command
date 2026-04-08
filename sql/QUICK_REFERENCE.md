# Quick Reference: Deploy to Supabase

## 30-Second Setup

```bash
# 1. Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# 2. Choose deployment method:

# Option A: Interactive Menu
npm run deploy

# Option B: Deploy specific migration
npm run deploy -- --db-polish
npm run deploy -- --all
npm run deploy -- --schema

# Option C: Manual (fastest for first time)
# Copy sql/db_polish.sql → Supabase SQL Editor → Run

# Option D: Bash script
bash scripts/deploy.sh --db-polish
```

---

## File Locations

| File | Purpose |
|------|---------|
| `sql/db_polish.sql` | 426-line migration with all 4 features |
| `sql/schema.sql` | Base schema (if starting fresh) |
| `sql/seed_realistic.sql` | Demo data |
| `scripts/deploy-to-supabase.js` | Node.js automation |
| `scripts/deploy.sh` | Bash helper script |
| `sql/DEPLOY_TO_SUPABASE.md` | Full deployment guide |
| `sql/SUPABASE_AUTOMATION_GUIDE.md` | Automation setup |

---

## Manual Process (Recommended First Time)

1. Copy `sql/db_polish.sql` entire contents
2. Go to: https://app.supabase.com → Your Project → SQL Editor
3. Paste the SQL code
4. Click "RUN" button
5. Verify: Triggers, functions, tables created
6. Check: Supabase Data Editor → see new objects

---

## Automated Process (Future Deployments)

### Prerequisites
```bash
npm install
# Creates .env.local with your keys
```

### Deploy
```bash
# All-in-one with npm script
npm run deploy:supabase

# Or via Node.js directly
node scripts/deploy-to-supabase.js --db-polish
```

---

## What Gets Deployed

✅ **trigger_phase_auto_dates** - Auto-sets phase dates on status change  
✅ **recompute_milestone_status()** - Updates milestone status from tasks  
✅ **mark_project_complete()** - RPC function to mark project done  
✅ **daily_snapshots** - Table for KPI trends  
✅ **record_daily_snapshot()** - Idempotent snapshot recorder  

All wrapped in **BEGIN...ROLLBACK** verification (safe to run multiple times)

---

## Get Your Supabase Keys

1. Go to: https://app.supabase.com
2. Login & select your project
3. Go to: **Settings → API**
4. Copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ Never commit `.env.local` (it's in .gitignore)

---

## Verify Deployment

```sql
-- In Supabase SQL Editor, run:

-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname LIKE 'trigger_phase%';

-- Check function exists
SELECT * FROM pg_proc WHERE proname = 'mark_project_complete';

-- Check table exists
SELECT * FROM daily_snapshots LIMIT 1;
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |
| "Function already exists" | It's designed to handle re-runs (uses `DROP IF EXISTS`) |
| Partial deployment | Check error message, fix, and re-run (idempotent) |
| Need to rollback | See `DEPLOY_TO_SUPABASE.md` rollback section |

---

## Next Steps

- [ ] Verify deployment in Supabase Dashboard
- [ ] Run smoke tests from `DEPLOY_TO_SUPABASE.md`
- [ ] Test in frontend: npm run dev
- [ ] Monitor logs in Supabase → Logs tab
