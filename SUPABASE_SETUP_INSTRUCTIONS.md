# Supabase Deployment Setup

## Current Status
✓ Supabase project URL is configured  
✗ Service Role Key is **missing**

## What You Need to Do

### Step 1: Get Your Service Role Key from Supabase
1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project: **V-Tech Project Command**
3. Go to **Settings → API**
4. Under "Project API keys", find **Service Role Key**
5. Copy this key (it starts with `eyJ...`)

### Step 2: Add the Key to .env
Edit the `.env` file in your project root and add:

```env
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key_here>
```

Example (with a real key):
```env
VITE_SUPABASE_URL=https://ksdqvauhsiwgbuiywvft.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Deploy db_polish.sql

Once you've added the service role key, run:

```bash
npm run deploy:supabase:polish
```

Or for interactive mode:
```bash
npm run deploy:supabase
```

## Available Deployment Commands

- `npm run deploy:supabase` — Interactive menu
- `npm run deploy:supabase:polish` — Deploy db_polish.sql (recommended)
- `npm run deploy:supabase:schema` — Deploy schema.sql
- `npm run deploy:supabase:seed` — Deploy seed data
- `npm run deploy:supabase:all` — Deploy all migrations in order
- `npm run deploy:supabase:dry-run` — Preview without executing
- `npm run verify:supabase` — Test the connection

## What db_polish.sql Contains

The migration includes 4 database improvements:
1. **Auto-date triggers** for project phases
2. **Milestone auto-status** based on task completion
3. **mark_project_complete()** RPC function for project finalization
4. **Daily snapshots** for KPI tracking

**Total: 426 lines of verified SQL**

## Need Help?

If you get an error after adding the key:
- Make sure there are no extra spaces around the key
- The .env file should NOT be committed to git
- Restart your terminal or IDE after editing .env

Contact: hansal@antigravity.dev
