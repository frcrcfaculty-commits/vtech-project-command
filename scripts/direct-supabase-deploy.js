#!/usr/bin/env node
/**
 * Direct Supabase SQL Deployment via HTTP
 * Attempts to use any available method to deploy SQL
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
let supabaseUrl, anonKey;

envContent.split('\n').forEach(line => {
  if (line.includes('VITE_SUPABASE_URL')) supabaseUrl = line.split('=')[1];
  if (line.includes('VITE_SUPABASE_ANON_KEY')) anonKey = line.split('=')[1];
});

console.log('Testing Supabase connectivity...');
console.log('URL:', supabaseUrl);

// Try to connect and see what endpoints are available
const urlObj = new URL(supabaseUrl);

// Attempt 1: Check if project is accessible
const checkProjectRequest = https.request({
  hostname: urlObj.hostname,
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    'apikey': anonKey
  }
}, (res) => {
  console.log('\n✓ Supabase project is accessible');
  console.log('Status:', res.statusCode);
  
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('\n✓ Project responds to API requests');
    console.log('\nTo complete the upload, you need to:');
    console.log('1. Get your SERVICE ROLE KEY from:');
    console.log('   Supabase Dashboard → Settings → API → Service Role key');
    console.log('2. Add to .env: SUPABASE_SERVICE_ROLE_KEY=your_key');
    console.log('3. Then run: npm run deploy:supabase:polish');
    console.log('\nOR use manual copy-paste method:');
    console.log('   npm run export:db-polish');
    console.log('   Copy output → Supabase SQL Editor → Execute');
  }
});

checkProjectRequest.on('error', (e) => {
  console.error('✗ Cannot reach Supabase project:', e.message);
});

checkProjectRequest.end();

