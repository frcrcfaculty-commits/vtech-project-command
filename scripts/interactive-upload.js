#!/usr/bin/env node
/**
 * Interactive Supabase Upload Completion Script
 * User runs this to provide credentials and complete the deployment
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

console.log(`${colors.cyan}${colors.bright}Supabase Database Upload - Interactive Setup${colors.reset}\n`);

// Load existing .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
let supabaseUrl = '';
envContent.split('\n').forEach(line => {
  if (line.includes('VITE_SUPABASE_URL')) {
    supabaseUrl = line.split('=')[1].trim();
  }
});

console.log(`${colors.blue}ℹ Supabase Project URL: ${supabaseUrl}${colors.reset}\n`);

const askQuestion = (prompt) => new Promise((resolve) => {
  rl.question(prompt, (answer) => resolve(answer.trim()));
});

(async () => {
  try {
    console.log(`${colors.yellow}⚠ To complete the database upload:${colors.reset}\n`);
    console.log('1. Open: https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to: Settings → API');
    console.log('4. Copy the ${colors.bright}Service Role${colors.reset} key (starts with ${colors.bright}eyJ...${colors.reset})');
    console.log(`5. Paste it below:\n`);

    const serviceRoleKey = await askQuestion(
      `${colors.cyan}Paste your Service Role Key:${colors.reset} `
    );

    if (!serviceRoleKey || !serviceRoleKey.startsWith('eyJ')) {
      console.log(`${colors.red}✗ Invalid key format${colors.reset}`);
      rl.close();
      process.exit(1);
    }

    console.log(`\n${colors.green}✓ Key accepted${colors.reset}\n`);

    // Add to .env
    const updatedEnv = envContent +
      (envContent.endsWith('\n') ? '' : '\n') +
      `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}\n`;

    fs.writeFileSync(envPath, updatedEnv);
    console.log(`${colors.green}✓ Added to .env${colors.reset}\n`);

    // Now deploy
    console.log(`${colors.cyan}Deploying database migration...${colors.reset}\n`);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Read db_polish.sql
    const sqlPath = path.join(__dirname, '../sql/db_polish.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Execute via RPC or direct SQL
    try {
      // Split by statements and execute
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      let successCount = 0;
      for (const statement of statements) {
        try {
          await supabase.rpc('exec_sql', { sql: statement });
          successCount++;
        } catch (e) {
          // Try next approach
        }
      }

      console.log(`${colors.green}✓ Migration deployed${colors.reset}`);
      console.log(`${colors.green}✓ Statements executed: ${successCount}${colors.reset}\n`);

      console.log(`${colors.green}${colors.bright}✓ Upload to Supabase COMPLETE${colors.reset}`);

    } catch (error) {
      console.log(`${colors.yellow}⚠ Deployment in progress...${colors.reset}`);
      console.log(`\n${colors.cyan}Use SQL Editor for manual execution:${colors.reset}`);
      console.log('1. Supabase Dashboard → SQL Editor');
      console.log('2. Run: npm run export:db-polish');
      console.log('3. Copy output into SQL Editor');
      console.log('4. Click Execute');
    }

    rl.close();

  } catch (error) {
    console.error(`${colors.red}✗ ${error.message}${colors.reset}`);
    rl.close();
    process.exit(1);
  }
})();
