#!/usr/bin/env node

/**
 * Deploy Database Migrations to Supabase
 * Usage: node scripts/deploy-to-supabase.js [--schema] [--db-polish] [--seed]
 * 
 * Examples:
 *   node scripts/deploy-to-supabase.js --schema          # Deploy only schema.sql
 *   node scripts/deploy-to-supabase.js --db-polish       # Deploy only db_polish.sql
 *   node scripts/deploy-to-supabase.js --seed            # Deploy seed data
 *   node scripts/deploy-to-supabase.js --all             # Deploy all migrations
 *   node scripts/deploy-to-supabase.js                   # Interactive menu
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color outputs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Parse command line arguments early to handle --help without credentials
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.bright}Deploy Database Migrations to Supabase${colors.reset}

Usage: node scripts/deploy-to-supabase.js [options]

Options:
  --schema              Deploy schema.sql only
  --db-polish           Deploy db_polish.sql only
  --seed                Deploy seed_realistic.sql only
  --all                 Deploy all migrations in order
  --dry-run             Preview without executing
  --help, -h            Show this help message

Examples:
  node scripts/deploy-to-supabase.js --all
  node scripts/deploy-to-supabase.js --schema --db-polish
  node scripts/deploy-to-supabase.js --dry-run
  node scripts/deploy-to-supabase.js              (interactive mode)

Environment Variables Required:
  VITE_SUPABASE_URL             Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Your Supabase service role key

Get these from: Supabase Dashboard → Settings → API
`);
  process.exit(0);
}

if (!supabaseUrl || !supabaseServiceRoleKey) {
  log.error('Missing environment variables!');
  console.log(`
${colors.yellow}Required:${colors.reset}
  VITE_SUPABASE_URL (or SUPABASE_URL)
  SUPABASE_SERVICE_ROLE_KEY

${colors.yellow}Setup:${colors.reset}
  1. Create a .env.local file in the project root
  2. Add your Supabase credentials:
     
     VITE_SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  
  3. Get your SERVICE_ROLE_KEY from:
     Supabase Dashboard → Settings → API → Service Role Key
  4. Run again: node scripts/deploy-to-supabase.js
`);
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// File paths
const sqlDir = path.join(__dirname, '../sql');
const files = {
  schema: path.join(sqlDir, 'schema.sql'),
  dbPolish: path.join(sqlDir, 'db_polish.sql'),
  seed: path.join(sqlDir, 'seed_realistic.sql'),
};

// Read SQL files
function readSqlFile(filePath, name) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    // Split by semicolons but keep them, handle multi-line statements
    const statements = content
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));
    
    return { content, statements, path: filePath };
  } catch (error) {
    log.error(`Failed to read ${name}: ${error.message}`);
    process.exit(1);
  }
}

// Execute SQL using Supabase RPC
async function executeSql(sqlContent, name, dryRun = false) {
  try {
    if (dryRun) {
      log.warning(`[DRY RUN] Would execute ${name}`);
      log.info(`SQL length: ${sqlContent.length} characters`);
      return true;
    }

    log.info(`Executing ${name}...`);

    // Execute using raw SQL via Supabase
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent,
    }).catch(() => {
      // Fallback: exec_sql function may not exist, try direct execution
      // This requires admin access via service_role_key
      return supabase.from('migrations').select('count');
    });

    if (error && !dryRun) {
      // If RPC doesn't exist, we need to use a different approach
      throw error;
    }

    log.success(`${name} executed successfully`);
    return true;
  } catch (error) {
    log.error(`Failed to execute ${name}: ${error.message}`);
    return false;
  }
}

// Alternative: Use SQL.js or direct HTTP approach
async function executeSqlDirect(sqlContent, name, dryRun = false) {
  try {
    if (dryRun) {
      log.warning(`[DRY RUN] Would execute ${name}`);
      return true;
    }

    log.info(`Executing ${name}...`);

    // Use Supabase REST API with raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({ sql: sqlContent }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    log.success(`${name} executed successfully`);
    return true;
  } catch (error) {
    log.error(`Failed to execute ${name}: ${error.message}`);
    return false;
  }
}

// Test Supabase connection
async function testConnection() {
  try {
    log.info('Testing Supabase connection...');
    const { data, error } = await supabase.from('projects').select('count');
    
    if (error) {
      throw error;
    }

    log.success('Connected to Supabase successfully!');
    return true;
  } catch (error) {
    log.error(`Failed to connect to Supabase: ${error.message}`);
    return false;
  }
}

// Interactive menu
async function interactiveMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  console.log(`
${colors.bright}${colors.cyan}=== SUPABASE MIGRATION DEPLOYMENT ===${colors.reset}

Choose which migrations to deploy:
  1. Schema only (schema.sql)
  2. DB Polish only (db_polish.sql)
  3. Seed data only (seed_realistic.sql)
  4. All migrations (schema → db_polish → seed)
  5. Dry run (preview without executing)
  6. Exit

`);

  const choice = await question(`${colors.cyan}Enter choice (1-6):${colors.reset} `);
  rl.close();

  return choice;
}

// Main deployment function
async function deploy(migrations = [], dryRun = false) {
  log.section('Database Migration Deployment');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    log.error('Cannot proceed without Supabase connection');
    process.exit(1);
  }

  // Execute migrations in order
  for (const migration of migrations) {
    const sqlFile = readSqlFile(files[migration], migration);
    
    log.info(`\nDeploying ${colors.bright}${migration}.sql${colors.reset}`);
    log.info(`File: ${sqlFile.path}`);
    log.info(`Size: ${sqlFile.content.length} bytes`);

    const success = await executeSqlDirect(sqlFile.content, migration, dryRun);
    
    if (!success && !dryRun) {
      log.error(`Migration failed: ${migration}`);
      log.warning('Stopping deployment. Previous migrations may have been applied.');
      process.exit(1);
    }
  }

  log.section('Deployment Complete!');
  if (!dryRun) {
    log.success('All migrations deployed successfully');
  }
  log.info('Next steps:');
  log.info('  1. Verify in Supabase Dashboard: Data Editor');
  log.info('  2. Run smoke tests: See DEPLOY_TO_SUPABASE.md');
  log.info('  3. Start development server: npm run dev');
}

// Parse command line arguments
async function main() {
  const args = process.argv.slice(2);

  let migrations = [];
  let dryRun = false;
  let interactive = true;

  for (const arg of args) {
    if (arg === '--schema') migrations.push('schema');
    if (arg === '--db-polish') migrations.push('dbPolish');
    if (arg === '--seed') migrations.push('seed');
    if (arg === '--all') migrations = ['schema', 'dbPolish', 'seed'];
    if (arg === '--dry-run') dryRun = true;
  }

  // If migrations were specified, run non-interactive
  if (migrations.length > 0) {
    interactive = false;
    await deploy(migrations, dryRun);
  } else if (args.includes('--help') || args.includes('-h')) {
    // Show help and exit
    console.log(`
${colors.bright}Deploy Database Migrations to Supabase${colors.reset}

Usage: node scripts/deploy-to-supabase.js [options]

Options:
  --schema              Deploy schema.sql only
  --db-polish           Deploy db_polish.sql only
  --seed                Deploy seed_realistic.sql only
  --all                 Deploy all migrations in order
  --dry-run             Preview without executing
  --help, -h            Show this help message

Examples:
  node scripts/deploy-to-supabase.js --all
  node scripts/deploy-to-supabase.js --schema --db-polish
  node scripts/deploy-to-supabase.js --dry-run
  node scripts/deploy-to-supabase.js              (interactive mode)

Environment Variables Required:
  VITE_SUPABASE_URL             Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Your Supabase service role key

Get these from: Supabase Dashboard → Settings → API
`);
  } else {
    // Interactive mode
    log.section('Supabase Migration Deployment');
    const choice = await interactiveMenu();

    const choiceMap = {
      '1': { migrations: ['schema'], label: 'Schema' },
      '2': { migrations: ['dbPolish'], label: 'DB Polish' },
      '3': { migrations: ['seed'], label: 'Seed Data' },
      '4': { migrations: ['schema', 'dbPolish', 'seed'], label: 'All Migrations' },
      '5': { migrations: ['schema', 'dbPolish', 'seed'], label: 'All Migrations (Dry Run)', dryRun: true },
      '6': { exit: true },
    };

    const selectedChoice = choiceMap[choice];

    if (!selectedChoice) {
      log.error('Invalid choice');
      process.exit(1);
    }

    if (selectedChoice.exit) {
      log.info('Exiting');
      process.exit(0);
    }

    log.info(`${selectedChoice.dryRun ? '[DRY RUN] ' : ''}Deploying: ${selectedChoice.label}`);
    await deploy(selectedChoice.migrations || [], selectedChoice.dryRun || false);
  }
}

main().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
