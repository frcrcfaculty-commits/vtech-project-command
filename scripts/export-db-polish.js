#!/usr/bin/env node

/**
 * Export db_polish.sql for manual upload
 * Usage: node scripts/export-db-polish.js [--output file.sql]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.join(__dirname, '../sql/db_polish.sql');
const args = process.argv.slice(2);
const outputArg = args.indexOf('--output');
const outputFile = outputArg !== -1 ? args[outputArg + 1] : null;

try {
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  const lineCount = sql.split('\n').length;
  
  console.log(`📄 db_polish.sql Export`);
  console.log(`📦 Size: ${(sql.length / 1024).toFixed(2)} KB`);
  console.log(`📝 Lines: ${lineCount}`);
  console.log(`✓ Ready to upload to Supabase SQL Editor\n`);
  
  if (outputFile) {
    fs.writeFileSync(outputFile, sql);
    console.log(`✓ Exported to: ${outputFile}`);
  } else {
    console.log('SQL Content (ready to copy):\n');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log(`\n✓ Copy the SQL above into Supabase SQL Editor and click RUN`);
  }
} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  process.exit(1);
}
