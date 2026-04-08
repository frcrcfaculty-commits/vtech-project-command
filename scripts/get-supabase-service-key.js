#!/usr/bin/env node
/**
 * Attempt to retrieve Supabase service role key
 * This would require authentication at Supabase
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔐 Supabase Service Role Key Retrieval');
console.log('====================================\n');

console.log('To get your Supabase Service Role Key:\n');
console.log('1. Visit: https://app.supabase.com');
console.log('2. Navigate to: Settings → API');
console.log('3. Under "Project API keys", copy the "service_role" key');
console.log('4. Add to .env: SUPABASE_SERVICE_ROLE_KEY=your_key\n');

// Check environment
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

let hasServiceKey = false;
envContent.split('\n').forEach(line => {
  if (line.includes('SUPABASE_SERVICE_ROLE_KEY') && !line.startsWith('#')) {
    hasServiceKey = true;
    console.log('✓ Service role key found in .env');
  }
});

if (!hasServiceKey) {
  console.log('⚠ Service role key NOT in .env');
  console.log('\nNote: This key requires manual retrieval from Supabase dashboard');
  console.log('It is sensitive and should not be shared or committed to git.\n');
  process.exit(0);
}
