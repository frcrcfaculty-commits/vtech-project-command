# Setup & Configuration Guide

## ✅ Step 1: Get Your Supabase Credentials

### Where to Find Them
1. Go to: https://app.supabase.com
2. Select your V-Tech project
3. Navigate to: **Settings → API**

### What to Copy
- **Project URL** - Looks like: `https://xxxxx.supabase.co`
- **`service_role` secret key** - Long string starting with `eyJ...`

⚠️ **IMPORTANT:** The service_role key is a SECRET. Keep it secure and never commit to git.

---

## ✅ Step 2: Configure Environment Variables

### Method A: Create .env.local (Recommended)
```bash
# In project root directory
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
```

**Verify it was created:**
```bash
cat .env.local
```

**Security note:** `.env.local` is in .gitignore and will NOT be committed to GitHub.

### Method B: Export as Environment Variables
```bash
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
```

### Method C: Use .env file
Create `.env` in project root (same format as .env.local)

---

## ✅ Step 3: Verify Connection

Test that your credentials are correct:

```bash
npm run verify:supabase
```

**Expected output if successful:**
```
🔍 Supabase Connection Verification

✅ Environment variables loaded
   URL: https://your-project.supabase.co
   Key: eyJ0eXAiOiJKV1QiLCJhbGc...

⏳ Testing Supabase connection...
✅ Successfully connected to Supabase!
   Query status: 200
   Projects found: 0

✨ Your environment is ready for deployment!
```

**If connection fails:**
- Check URL is correct (no typos)
- Check service_role_key is correct (paste it again)
- Verify your Supabase project is running
- Check your firewall/VPN allows connections

---

## ✅ Step 4: Deploy Database Migration

### Quick Deploy
```bash
npm run deploy:supabase:polish
```

### Or Choose Your Method

**Interactive menu:**
```bash
npm run deploy:supabase
```

**Specific migration:**
```bash
npm run deploy:supabase:schema      # Schema only
npm run deploy:supabase:seed        # Seed data only
npm run deploy:supabase:all         # All migrations
```

**Preview without executing:**
```bash
npm run deploy:supabase:dry-run
```

---

## ✅ Step 5: Verify Deployment

### In Supabase Dashboard
1. Go to: SQL Editor
2. Run these queries:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_phase_auto_dates';
   SELECT * FROM pg_proc WHERE proname = 'mark_project_complete';
   SELECT COUNT(*) FROM daily_snapshots;
   ```
3. All should return results (triggers/functions exist)

### In Data Editor
1. Go to: Data Editor
2. Look for new table: `daily_snapshots` ✓
3. Look for new function: `mark_project_complete` ✓

---

## 🔄 Manual Verification Checklist

- [ ] Credentials obtained from Supabase Settings
- [ ] .env.local created with correct values
- [ ] `npm run verify:supabase` returns success
- [ ] db_polish.sql deployed (no SQL errors)
- [ ] Triggers visible in Supabase Dashboard
- [ ] Functions visible in Supabase Dashboard
- [ ] daily_snapshots table exists
- [ ] Frontend tests pass: `npm run dev`

---

## 🛠️ Troubleshooting

### Issue: "Missing VITE_SUPABASE_URL"
**Solution:** Create .env.local with your URL
```bash
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env.local
```

### Issue: "Connection refused"
**Solution:** 
- Verify URL is correct (no trailing slash)
- Check Supabase project is running
- Try pinging the URL in browser

### Issue: "Authentication failed"
**Solution:**
- Verify service_role_key is correct (copy it again)
- Make sure it's the `service_role` key, not `anon` key
- Check key hasn't expired (Settings → API)

### Issue: "SQL syntax error"
**Solution:**
- Check db_polish.sql file hasn't been modified
- Ensure schema.sql was run first (if fresh database)
- Review error message for specific SQL issue

### Issue: "Function mark_project_complete already exists"
**Solution:** This is OK! Script includes `DROP IF EXISTS`, just re-run:
```bash
npm run deploy:supabase:polish
```

---

## 🔐 Security Best Practices

✅ **DO:**
- Store credentials in .env.local (never committed)
- Rotate keys monthly
- Use service_role_key only for deployments
- Use anon_key for frontend operations

❌ **DON'T:**
- Commit .env.local to git
- Share service_role_key in Slack/Teams
- Use service_role_key in frontend code
- Expose credentials in error messages

---

## 🚀 Next Deployment

Once configured, future deployments are just:
```bash
npm run deploy:supabase:polish
```

No need to reconfigure. Credentials stored in .env.local are reused.

---

## 📚 Reference Files

- `QUICKSTART.md` - 30-second overview
- `DEPLOYMENT_SUMMARY.md` - Complete reference
- `scripts/verify-supabase.js` - Connection test script
- `scripts/deploy-to-supabase.js` - Deployment automation
- `scripts/deploy.sh` - Bash alternative

---

## ✨ You're Ready!

Once you see "Your environment is ready for deployment!", you can deploy anytime with:

```bash
npm run deploy:supabase:polish
```

Enjoy automated database deployments! 🎉
