// ============================================================
// V-TECH PROJECT COMMAND — Create Auth Users
//
// USAGE:
//   1. export SUPABASE_URL=https://your-project.supabase.co
//   2. export SUPABASE_SERVICE_ROLE_KEY=eyJ...
//   3. Run this AFTER schema.sql, BEFORE seed_realistic.sql
//   4. node sql/create_auth_users.js
//
// Default password for all 15 users: "vtech2026"
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_USERS = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'vishal@vtech.com',  name: 'Vishal Shah' },
  { id: '11111111-1111-1111-1111-111111111112', email: 'hansal@vtech.com',  name: 'Hansal Shah' },
  { id: '22222222-2222-2222-2222-222222222221', email: 'rakesh@vtech.com',  name: 'Rakesh Iyer' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'priya@vtech.com',   name: 'Priya Menon' },
  { id: '22222222-2222-2222-2222-222222222223', email: 'suresh@vtech.com',  name: 'Suresh Naik' },
  { id: '22222222-2222-2222-2222-222222222224', email: 'anand@vtech.com',   name: 'Anand Krishnan' },
  { id: '22222222-2222-2222-2222-222222222225', email: 'deepak@vtech.com',  name: 'Deepak Rao' },
  { id: '33333333-3333-3333-3333-333333333331', email: 'rahul@vtech.com',   name: 'Rahul Sharma' },
  { id: '33333333-3333-3333-3333-333333333332', email: 'amit@vtech.com',    name: 'Amit Patel' },
  { id: '33333333-3333-3333-3333-333333333333', email: 'sneha@vtech.com',   name: 'Sneha Desai' },
  { id: '33333333-3333-3333-3333-333333333334', email: 'vikram@vtech.com',  name: 'Vikram Singh' },
  { id: '33333333-3333-3333-3333-333333333335', email: 'neha@vtech.com',    name: 'Neha Joshi' },
  { id: '33333333-3333-3333-3333-333333333336', email: 'karan@vtech.com',   name: 'Karan Mehta' },
  { id: '33333333-3333-3333-3333-333333333337', email: 'pooja@vtech.com',   name: 'Pooja Reddy' },
  { id: '33333333-3333-3333-3333-333333333338', email: 'sandeep@vtech.com', name: 'Sandeep Kumar' },
];

const PASSWORD = 'vtech2026';

(async () => {
  let created = 0, skipped = 0, failed = 0;
  for (const u of SEED_USERS) {
    try {
      const { data, error } = await admin.auth.admin.createUser({
        id: u.id,
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: u.name },
      });
      if (error) {
        if (error.message?.toLowerCase().includes('already')) {
          console.log(`⊙  ${u.email} already exists, skipping`);
          skipped++;
        } else {
          console.error(`✗  ${u.email}: ${error.message}`);
          failed++;
        }
      } else {
        console.log(`✓  Created ${u.email} (${data.user?.id})`);
        created++;
      }
    } catch (err) {
      console.error(`✗  ${u.email}: ${err.message}`);
      failed++;
    }
  }
  console.log('\n=== SUMMARY ===');
  console.log(`Created: ${created}   Skipped: ${skipped}   Failed: ${failed}`);
  console.log(`\nDefault password: ${PASSWORD}`);
  console.log('Now run sql/seed_realistic.sql in Supabase SQL editor.');
})();
