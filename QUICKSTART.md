# 🚀 DB POLISH DEPLOYMENT - QUICK START

## 30 Seconds to Deploy

```bash
# 1. Set your Supabase URL and key
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# 2. Deploy
npm run deploy:supabase:polish

# That's it! ✅
```

**OR** for manual deployment:
```
1. Open: https://app.supabase.com
2. Go to: SQL Editor
3. Copy: sql/db_polish.sql (all 426 lines)
4. Paste into SQL Editor
5. Click: RUN
```

---

## What Gets Deployed

✅ Phase auto-date trigger  
✅ Milestone auto-status logic  
✅ mark_project_complete() RPC function  
✅ daily_snapshots KPI table  

---

## Get Your Keys

From Supabase Dashboard:
- Settings → API → Project URL
- Settings → API → service_role key

Save to `.env.local` (never commit)

---

## Files Included

- **sql/db_polish.sql** - Main migration (426 lines)
- **sql/QUICK_REFERENCE.md** - Detailed reference
- **scripts/deploy-to-supabase.js** - Automation script
- **DEPLOYMENT_SUMMARY.md** - Full documentation

---

## Verify It Worked

After deployment, check Supabase Data Editor:
- Tables: `daily_snapshots` ✓
- Functions: `mark_project_complete` ✓
- Triggers: `trigger_phase_auto_dates` ✓

---

## Next Steps

1. Run smoke tests (see DEPLOY_TO_SUPABASE.md)
2. Test frontend: `npm run dev`
3. Monitor Supabase logs

---

**Status:** Production Ready ✅  
**Version:** v1.0.0-pilot  
**Questions?** See DEPLOYMENT_SUMMARY.md
