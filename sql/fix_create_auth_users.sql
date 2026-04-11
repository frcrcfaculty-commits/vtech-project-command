-- ============================================================
-- CREATE AUTH USERS VIA SQL
-- Run this in Supabase Dashboard → SQL Editor
-- This creates all 15 V-Tech users in auth.users
-- Password for ALL users: vtech2026
-- ============================================================

-- Use Supabase's internal function to create auth users
-- This bypasses the need for the Service Role Key

-- Helper: create user if not exists
CREATE OR REPLACE FUNCTION temp_create_user(
  p_id UUID,
  p_email TEXT,
  p_name TEXT,
  p_password TEXT DEFAULT 'vtech2026'
) RETURNS VOID AS $$
DECLARE
  v_encrypted_pw TEXT;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = p_id OR email = p_email) THEN
    RAISE NOTICE 'User % already exists, skipping', p_email;
    RETURN;
  END IF;

  -- Generate encrypted password using pgcrypto
  v_encrypted_pw := crypt(p_password, gen_salt('bf'));

  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    v_encrypted_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_name),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Also create identity record (required for email login)
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_id,
    p_email,
    jsonb_build_object('sub', p_id::text, 'email', p_email),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Created user: %', p_email;
END;
$$ LANGUAGE plpgsql;

-- Create all 15 users
SELECT temp_create_user('11111111-1111-1111-1111-111111111111', 'vishal@vtech.com', 'Vishal Shah');
SELECT temp_create_user('11111111-1111-1111-1111-111111111112', 'hansal@vtech.com', 'Hansal Shah');
SELECT temp_create_user('22222222-2222-2222-2222-222222222221', 'rakesh@vtech.com', 'Rakesh Iyer');
SELECT temp_create_user('22222222-2222-2222-2222-222222222222', 'priya@vtech.com', 'Priya Menon');
SELECT temp_create_user('22222222-2222-2222-2222-222222222223', 'suresh@vtech.com', 'Suresh Naik');
SELECT temp_create_user('22222222-2222-2222-2222-222222222224', 'anand@vtech.com', 'Anand Krishnan');
SELECT temp_create_user('22222222-2222-2222-2222-222222222225', 'deepak@vtech.com', 'Deepak Rao');
SELECT temp_create_user('33333333-3333-3333-3333-333333333331', 'rahul@vtech.com', 'Rahul Sharma');
SELECT temp_create_user('33333333-3333-3333-3333-333333333332', 'amit@vtech.com', 'Amit Patel');
SELECT temp_create_user('33333333-3333-3333-3333-333333333333', 'sneha@vtech.com', 'Sneha Desai');
SELECT temp_create_user('33333333-3333-3333-3333-333333333334', 'vikram@vtech.com', 'Vikram Singh');
SELECT temp_create_user('33333333-3333-3333-3333-333333333335', 'neha@vtech.com', 'Neha Joshi');
SELECT temp_create_user('33333333-3333-3333-3333-333333333336', 'karan@vtech.com', 'Karan Mehta');
SELECT temp_create_user('33333333-3333-3333-3333-333333333337', 'pooja@vtech.com', 'Pooja Reddy');
SELECT temp_create_user('33333333-3333-3333-3333-333333333338', 'sandeep@vtech.com', 'Sandeep Kumar');

-- Clean up temp function
DROP FUNCTION temp_create_user(UUID, TEXT, TEXT, TEXT);

-- Verify
SELECT id, email, email_confirmed_at FROM auth.users ORDER BY email;
