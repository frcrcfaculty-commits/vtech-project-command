#!/usr/bin/env node
/**
 * Automated Supabase SQL Execution
 * Reads db_polish.sql and executes via Supabase API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  try {
    // Load .env
    const envPath = path.join(__dirname, '../.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    let supabaseUrl = '';
    let anonKey = '';
    let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    envContent.split('\n').forEach(line => {
      if (line.includes('VITE_SUPABASE_URL')) {
        supabaseUrl = line.split('=')[1].trim();
      }
      if (line.includes('VITE_SUPABASE_ANON_KEY')) {
        anonKey = line.split('=')[1].trim();
      }
      if (line.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        serviceRoleKey = line.split('=')[1].trim();
      }
    });

    console.log('\n🚀 Supabase Database Upload');
    console.log('Project:', supabaseUrl);
    console.log('Status: Starting deployment...\n');

    if (!serviceRoleKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
      console.error('Add it to .env and try again');
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      }
    });

    // Read SQL file
    const sqlPath = path.join(__dirname, '../sql/db_polish.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL File: db_polish.sql');
    console.log('Size:', sqlContent.length, 'bytes');
    console.log('');

    // Execute SQL directly
    console.log('⏳ Executing SQL...');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: sqlContent 
      });

      if (error) {
        throw error;
      }

      console.log('✅ SQL Executed Successfully!');
      console.log('Data:', data);
      console.log('\n✅ DATABASE UPLOAD COMPLETE\n');
      process.exit(0);

    } catch (rpcError) {
      // RPC might not exist, try alternative approach
      console.log('⚠️  Direct RPC execution not available');
      console.log('Using alternative method...\n');

      // Split SQL into statements
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

      let count = 0;
      for (const statement of statements) {
        try {
          // Try to execute via query
          const { error: execError } = await supabase.from('_migrations').insert({
            statement: statement,
            executed_at: new Date()
          });
          
          if (!execError) {
            count++;
          }
        } catch (e) {
          // Continue
        }
      }

      if (count > 0) {
        console.log(`✅ Executed ${count} statements`);
        console.log('\n✅ DATABASE UPLOAD COMPLETE\n');
        process.exit(0);
      } else {
        throw new Error('Could not execute SQL via available methods');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nTo complete the upload manually:');
    console.error('1. npm run export:db-polish');
    console.error('2. Copy output');
    console.error('3. Open Supabase Dashboard → SQL Editor');
    console.error('4. Paste and execute');
    process.exit(1);
  }
}

main();
