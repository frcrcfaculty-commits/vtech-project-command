#!/usr/bin/env node

/**
 * Supabase Connection Verifier
 * Tests that environment variables are correctly configured
 * Usage: node scripts/verify-supabase.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Supabase Connection Verification\n');

// Check environment variables
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_URL');
  process.exit(1);
}

if (!supabaseServiceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseServiceRoleKey.substring(0, 20)}...`);

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

console.log('\n⏳ Testing Supabase connection...');

// Test connection by querying projects table
const testConnection = async () => {
  try {
    const { data, error, status } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (error) {
      console.error(`❌ Connection error: ${error.message}`);
      process.exit(1);
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log(`   Query status: ${status}`);
    console.log(`   Projects found: ${data?.length || 0}`);
    console.log('\n✨ Your environment is ready for deployment!\n');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}`);
    process.exit(1);
  }
};

testConnection();
