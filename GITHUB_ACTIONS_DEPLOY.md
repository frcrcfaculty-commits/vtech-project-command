# GitHub Actions Automated Deployment

**Status:** ✅ Workflow Ready  
**Execution Location:** GitHub Actions CI/CD  
**Time to Deploy:** 2 minutes setup + 1 minute execution

---

## How It Works

The `.github/workflows/deploy-supabase.yml` workflow automat ically deploys your database migration to Supabase when:
1. You push to `release/v1` branch, OR
2. You manually trigger it from GitHub Actions tab

---

## Setup Steps (One-Time)

### Step 1: Add GitHub Repository Secrets

Go to: **GitHub → Settings → Secrets and variables → Actions**

Add these **two** secrets:

**Secret 1: SUPABASE_URL**
- Name: `SUPABASE_URL`
- Value: `https://ksdqvauhsiwgbuiywvft.supabase.co` (your project URL)

**Secret 2: SUPABASE_SERVICE_ROLE_KEY**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Paste your service role key from Supabase Dashboard → Settings → API

**Secret 3: SUPABASE_ANON_KEY** (Optional, for verification)
- Name: `SUPABASE_ANON_KEY`
- Value: Your anonymous key (already in .env)

---

## Execute Deployment

### Option A: Manual Trigger (Recommended for First Deploy)

1. Go to: **GitHub Repository → Actions**
2. Select: **"Deploy to Supabase" workflow**
3. Click: **"Run workflow" button**
4. Select branch: `release/v1`
5. Click: **"Run workflow"**
6. Watch the execution in real-time

### Option B: Automatic Trigger

Simply push to `release/v1` branch:
```bash
git push origin release/v1
```

The workflow will automatically execute.

---

## What Happens During Execution

```
1. Checkout code from release/v1
2. Set up Node.js environment
3. Install dependencies
4. Execute db_polish.sql via Supabase API
5. Verify deployment with validation tests
6. Report success/failure
```

**Estimated time:** 1-2 minutes

---

## Verify Deployment Succeeded

After workflow completes:

### Check GitHub Actions Output
- Go to: **Actions tab**
- Click: **Latest workflow run**
- Look for: ✅ Green checkmark (success)

### Check Supabase Dashboard
- Go to: https://app.supabase.com
- Select your project
- Go to: **SQL Editor**
- Look for tables/functions:
  - ✓ `daily_snapshots` table
  - ✓ `trigger_phase_auto_dates` function
  - ✓ `trigger_task_milestone_status` function
  - ✓ `recompute_milestone_status` function
  - ✓ `mark_project_complete` function

---

## Troubleshooting

### "Secrets not found" error
- ✅ Go to Settings → Secrets → Actions
- ✅ Verify secret names are EXACTLY as listed above
- ✅ Try re-creating them

### "Authorization failed" error
- ✅ Check that you copied the right key (Service Role, not Anon)
- ✅ Verify key hasn't expired
- ✅ Copy the entire key including all characters

### Workflow won't run
- ✅ Ensure you're on `release/v1` branch
- ✅ Make sure `.github/workflows/deploy-supabase.yml` exists
- ✅ Commit and push the workflow file

---

## Alternative: Manual Execution

If you prefer NOT to use GitHub Actions:

```bash
# Method 1: Copy-paste (No setup needed)
npm run export:db-polish
# Copy output, paste in Supabase SQL Editor, execute

# Method 2: Interactive (Requires service key in .env)
npm run upload:interactive
# Prompts for service key, then deploys
```

---

## Status Check

✅ Workflow file created: `.github/workflows/deploy-supabase.yml`  
✅ All npm scripts ready  
✅ All documentation complete  
⏳ Waiting for: GitHub secrets setup

---

**Next Step:** Set up the 2-3 GitHub secrets, then run the workflow!
