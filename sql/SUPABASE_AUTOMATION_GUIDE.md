# Supabase Migration Automation Guide

## Overview

This guide provides both manual and automated methods to deploy migrations to Supabase.

---

## MANUAL PROCESS (for immediate use)

### Step 1: Prepare Your Migration File
The file is ready at: `sql/db_polish.sql` (426 lines)

**File contains:**
- ✅ TASK 1: Phase auto-date trigger
- ✅ TASK 2: Milestone auto-status trigger
- ✅ TASK 3: mark_project_complete() RPC function
- ✅ TASK 4: daily_snapshots table + record_daily_snapshot() 
- ✅ VERIFICATION: Test block with BEGIN...ROLLBACK

### Step 2: Open Supabase SQL Editor
1. Go to: https://app.supabase.com
2. Select your project
3. Navigate to: **SQL Editor** (sidebar)

### Step 3: Deploy Each Migration IN ORDER

#### Migration 1: Create Base Schema (IF STARTING FRESH)
```sql
-- Copy contents of sql/schema.sql
-- Paste into SQL Editor
-- Click "Run" button
```

#### Migration 2: Deploy DB Polish
```sql
-- Copy contents of sql/db_polish.sql
-- Paste into SQL Editor
-- Click "Run" button
```

**Expected Output:**
```
✓ All 4 components created:
  - trigger_phase_auto_dates (BEFORE UPDATE on project_phases)
  - recompute_milestone_status() function
  - trigger_task_milestone_status (AFTER INSERT/UPDATE/DELETE on tasks)
  - mark_project_complete(UUID) RPC function
  - daily_snapshots table
  - record_daily_snapshot() function

✓ Test block runs (wrapped in BEGIN...ROLLBACK)
✓ Database is left unchanged (ROLLBACK executed)
```

#### Migration 3: Load Seed Data (Optional)
```bash
# In SQL Editor, run sql/seed_realistic.sql
# OR run via Node.js:
node sql/create_auth_users.js
```

### Step 4: Verify Deployment
Run this in Supabase SQL Editor:
```sql
-- Check phase trigger
SELECT * FROM pg_trigger WHERE tgname = 'trigger_phase_auto_dates';

-- Check mark_project_complete function
SELECT * FROM pg_proc WHERE proname = 'mark_project_complete';

-- Check daily_snapshots table
SELECT * FROM daily_snapshots LIMIT 1;

-- Check RLS policies (should be enabled)
SELECT * FROM pg_policies LIMIT 5;
```

---

## AUTOMATED PROCESS (for future deployments)

### Prerequisites

Install Node.js dependencies:
```bash
npm install
```

This includes `@supabase/supabase-js` which the automation script needs.

### Setup Environment Variables

Create a `.env.local` file in the project root:
```bash
cat > .env.local << 'EOF'
# Supabase URLs and Keys (Get from Settings → API)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
```

**How to find your keys:**
1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **Settings → API**
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **SECURITY WARNING:** Never commit `.env.local` to git! It's already in `.gitignore`.

### Run Automated Deployment

#### Interactive Menu (Recommended for First Time)
```bash
node scripts/deploy-to-supabase.js
```

This shows:
```
=== SUPABASE MIGRATION DEPLOYMENT ===

Choose which migrations to deploy:
  1. Schema only (schema.sql)
  2. DB Polish only (db_polish.sql)
  3. Seed data only (seed_realistic.sql)
  4. All migrations (schema → db_polish → seed)
  5. Dry run (preview without executing)
  6. Exit

Enter choice (1-6): 
```

#### Command-Line Deployment

**Deploy DB Polish only:**
```bash
node scripts/deploy-to-supabase.js --db-polish
```

**Deploy all migrations:**
```bash
node scripts/deploy-to-supabase.js --all
```

**Preview without executing (dry run):**
```bash
node scripts/deploy-to-supabase.js --dry-run
```

**Schema only:**
```bash
node scripts/deploy-to-supabase.js --schema
```

**Seed data only:**
```bash
node scripts/deploy-to-supabase.js --seed
```

#### Help
```bash
node scripts/deploy-to-supabase.js --help
```

### Script Output Example

```
✓ Connected to Supabase successfully!

Deploying db_polish.sql
File: /path/to/sql/db_polish.sql
Size: 9847 bytes

ℹ Executing db_polish.sql...
✓ db_polish.sql executed successfully

=== Deployment Complete! ===

✓ All migrations deployed successfully
Next steps:
  1. Verify in Supabase Dashboard: Data Editor
  2. Run smoke tests: See DEPLOY_TO_SUPABASE.md
  3. Start development server: npm run dev
```

---

## ADVANCED: CI/CD INTEGRATION

### GitHub Actions Workflow

Create `.github/workflows/deploy-to-supabase.yml`:

```yaml
name: Deploy to Supabase

on:
  workflow_dispatch:  # Manual trigger from Actions tab
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      migrations:
        description: 'Migrations to deploy'
        required: true
        default: 'db-polish'
        type: choice
        options:
          - schema
          - db-polish
          - seed
          - all

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Deploy migrations
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          case "${{ inputs.migrations }}" in
            schema) node scripts/deploy-to-supabase.js --schema ;;
            db-polish) node scripts/deploy-to-supabase.js --db-polish ;;
            seed) node scripts/deploy-to-supabase.js --seed ;;
            all) node scripts/deploy-to-supabase.js --all ;;
          esac
      
      - name: Run smoke tests
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: npm run test:smoke
```

### GitHub Secrets Setup

1. Go to: **Settings → Secrets and variables → Actions**
2. Add these secrets:
   - `SUPABASE_URL` - Your project URL
   - `SUPABASE_ANON_KEY` - Public anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Secret service role key

### Deploy via GitHub UI

1. Go to: **Actions → Deploy to Supabase**
2. Click: **Run workflow**
3. Select environment (staging/production)
4. Select migrations to deploy
5. Click: **Run workflow**

---

## TROUBLESHOOTING

### Error: "Missing environment variables"
```bash
# Solution: Create .env.local with your Supabase credentials
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF
```

### Error: "Failed to connect to Supabase"
- Verify `VITE_SUPABASE_URL` is correct
- Check that `SUPABASE_SERVICE_ROLE_KEY` is not expired
- Try refreshing your API keys in Supabase Settings

### Error: "CREATE TRIGGER... already exists"
- Migrations include `DROP TRIGGER IF EXISTS` to handle re-runs
- This is safe to re-run multiple times

### Partial deployment (some migrations succeeded, some failed)
1. Check error in console output
2. Fix the issue in the SQL file
3. Re-run just that migration:
   ```bash
   node scripts/deploy-to-supabase.js --db-polish
   ```

---

## ROLLBACK PROCEDURE

If something goes wrong:

### Option 1: Manual Rollback (Safest)
1. Go to Supabase SQL Editor
2. Run:
   ```sql
   -- Drop the functions/triggers
   DROP TRIGGER IF EXISTS trigger_phase_auto_dates ON project_phases;
   DROP TRIGGER IF EXISTS trigger_task_milestone_status ON tasks;
   DROP FUNCTION IF EXISTS trigger_phase_auto_dates();
   DROP FUNCTION IF EXISTS recompute_milestone_status(UUID);
   DROP FUNCTION IF EXISTS trigger_task_milestone_status();
   DROP FUNCTION IF EXISTS mark_project_complete(UUID);
   DROP TABLE IF EXISTS daily_snapshots;
   DROP FUNCTION IF EXISTS record_daily_snapshot();
   ```
3. Re-run db_polish.sql with fixes

### Option 2: Full Database Reset (⚠️ Data Loss)
```sql
-- WARNING: This drops everything!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Then re-run schema.sql + db_polish.sql
```

---

## FUTURE MIGRATIONS

When adding new features:

1. Create new SQL file: `sql/new_feature.sql`
2. Add to deployment script:
   ```javascript
   // In scripts/deploy-to-supabase.js, add to files object:
   newFeature: path.join(sqlDir, 'new_feature.sql'),
   ```
3. Deploy:
   ```bash
   node scripts/deploy-to-supabase.js --new-feature
   ```

---

## VERIFICATION CHECKLIST

After deployment:

- [ ] No errors in SQL Editor output
- [ ] Triggers visible in Supabase
- [ ] RPC function callable via `supabase.rpc('mark_project_complete', {...})`
- [ ] daily_snapshots table exists and is queryable
- [ ] Frontend tests pass (npm run test)
- [ ] App compiles without errors (npm run dev)

---

## Support

For issues:
1. Check Supabase Logs: **Supabase Dashboard → Logs → Database**
2. Review error message for SQL syntax issues
3. Verify credentials in `.env.local`
4. Contact DevOps with error details
