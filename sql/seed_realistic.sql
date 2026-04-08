-- ============================================================
-- V-TECH PROJECT COMMAND — REALISTIC SEED DATA
-- Run AFTER schema.sql, AFTER creating auth.users via create_auth_users.js
-- Run BEFORE db_polish.sql (so seed phase statuses don't trip auto-date triggers)
-- ============================================================

DO $$
DECLARE
  t_sales UUID;
  t_design UUID;
  t_proc UUID;
  t_install UUID;
  t_program UUID;
  t_service UUID;
  t_admin UUID;
BEGIN
  SELECT id INTO t_sales FROM teams WHERE name = 'Sales/BD';
  SELECT id INTO t_design FROM teams WHERE name = 'Design/Engineering';
  SELECT id INTO t_proc FROM teams WHERE name = 'Procurement';
  SELECT id INTO t_install FROM teams WHERE name = 'Installation';
  SELECT id INTO t_program FROM teams WHERE name = 'Programming';
  SELECT id INTO t_service FROM teams WHERE name = 'Service/AMC';
  SELECT id INTO t_admin FROM teams WHERE name = 'Admin';

  INSERT INTO users (id, full_name, email, phone, role, team_id, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Vishal Shah', 'vishal@vtech.com', '+919820000001', 'owner', t_admin, TRUE),
    ('11111111-1111-1111-1111-111111111112', 'Hansal Shah', 'hansal@vtech.com', '+919820000002', 'owner', t_admin, TRUE),
    ('22222222-2222-2222-2222-222222222221', 'Rakesh Iyer', 'rakesh@vtech.com', '+919820000003', 'team_lead', t_sales, TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Priya Menon', 'priya@vtech.com', '+919820000004', 'team_lead', t_design, TRUE),
    ('22222222-2222-2222-2222-222222222223', 'Suresh Naik', 'suresh@vtech.com', '+919820000005', 'team_lead', t_install, TRUE),
    ('22222222-2222-2222-2222-222222222224', 'Anand Krishnan', 'anand@vtech.com', '+919820000006', 'team_lead', t_program, TRUE),
    ('22222222-2222-2222-2222-222222222225', 'Deepak Rao', 'deepak@vtech.com', '+919820000007', 'team_lead', t_service, TRUE),
    ('33333333-3333-3333-3333-333333333331', 'Rahul Sharma', 'rahul@vtech.com', '+919820000011', 'field_staff', t_install, TRUE),
    ('33333333-3333-3333-3333-333333333332', 'Amit Patel', 'amit@vtech.com', '+919820000012', 'field_staff', t_install, TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Sneha Desai', 'sneha@vtech.com', '+919820000013', 'field_staff', t_install, TRUE),
    ('33333333-3333-3333-3333-333333333334', 'Vikram Singh', 'vikram@vtech.com', '+919820000014', 'field_staff', t_program, TRUE),
    ('33333333-3333-3333-3333-333333333335', 'Neha Joshi', 'neha@vtech.com', '+919820000015', 'field_staff', t_program, TRUE),
    ('33333333-3333-3333-3333-333333333336', 'Karan Mehta', 'karan@vtech.com', '+919820000016', 'field_staff', t_design, TRUE),
    ('33333333-3333-3333-3333-333333333337', 'Pooja Reddy', 'pooja@vtech.com', '+919820000017', 'field_staff', t_proc, TRUE),
    ('33333333-3333-3333-3333-333333333338', 'Sandeep Kumar', 'sandeep@vtech.com', '+919820000018', 'field_staff', t_service, TRUE)
  ON CONFLICT (id) DO NOTHING;
END $$;

INSERT INTO projects (id, name, client_name, project_type, city, status, start_date, target_end_date, created_by, notes) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Reliance Jio HQ Boardroom',     'Reliance Industries', 'boardroom',         'Mumbai',    'active',    CURRENT_DATE - 60, CURRENT_DATE + 30,  '11111111-1111-1111-1111-111111111111', 'Premium boardroom with Crestron control'),
  ('a0000001-0000-0000-0000-000000000002', 'Tata Group Conference Hub',     'Tata Group',          'conference_room',   'Pune',      'active',    CURRENT_DATE - 45, CURRENT_DATE + 45,  '11111111-1111-1111-1111-111111111111', '4 conference rooms with VC integration'),
  ('a0000001-0000-0000-0000-000000000003', 'Ambani Residence Phase 2',      'Ambani Family',       'residential',       'Mumbai',    'active',    CURRENT_DATE - 75, CURRENT_DATE + 15,  '11111111-1111-1111-1111-111111111112', 'Whole-home automation upgrade'),
  ('a0000001-0000-0000-0000-000000000004', 'HDFC Bank Training Center',     'HDFC Bank',           'conference_room',   'Bangalore', 'planning',  CURRENT_DATE - 10, CURRENT_DATE + 90,  '11111111-1111-1111-1111-111111111111', 'Hybrid learning facility, 6 rooms'),
  ('a0000001-0000-0000-0000-000000000005', 'Wipro Auditorium Upgrade',      'Wipro Ltd',           'auditorium',        'Bangalore', 'active',    CURRENT_DATE - 55, CURRENT_DATE + 20,  '11111111-1111-1111-1111-111111111112', '500-seat auditorium AV refresh'),
  ('a0000001-0000-0000-0000-000000000006', 'Adani Experience Centre',       'Adani Group',         'experience_centre', 'Ahmedabad', 'on_hold',   CURRENT_DATE - 40, CURRENT_DATE + 60,  '11111111-1111-1111-1111-111111111111', 'Awaiting client design approval'),
  ('a0000001-0000-0000-0000-000000000007', 'Infosys Boardroom Series',      'Infosys Ltd',         'boardroom',         'Hyderabad', 'active',    CURRENT_DATE - 30, CURRENT_DATE + 50,  '11111111-1111-1111-1111-111111111112', '3 executive boardrooms'),
  ('a0000001-0000-0000-0000-000000000008', 'L&T Office Lighting',           'Larsen & Toubro',     'lighting_hvac',     'Delhi',     'completed', CURRENT_DATE - 120, CURRENT_DATE - 10, '11111111-1111-1111-1111-111111111111', 'DALI lighting + HVAC integration')
ON CONFLICT (id) DO NOTHING;

-- Phase statuses + dates (triggers in db_polish.sql haven't run yet, so direct UPDATE is safe)
DO $$
DECLARE
  proj_rec RECORD;
  phase_rec RECORD;
  phase_idx INT;
  proj_start DATE;
  proj_end DATE;
  proj_status TEXT;
  cur_phase_idx INT;
  per_phase_days INT;
BEGIN
  FOR proj_rec IN SELECT id, status, start_date, target_end_date FROM projects LOOP
    proj_start := proj_rec.start_date;
    proj_end := proj_rec.target_end_date;
    proj_status := proj_rec.status;
    per_phase_days := GREATEST(1, (proj_end - proj_start) / 10);

    cur_phase_idx := CASE proj_status
      WHEN 'completed' THEN 11
      WHEN 'on_hold'   THEN 4
      WHEN 'planning'  THEN 1
      ELSE 6
    END;

    phase_idx := 1;
    FOR phase_rec IN
      SELECT id FROM project_phases WHERE project_id = proj_rec.id ORDER BY phase_order
    LOOP
      UPDATE project_phases SET
        planned_start = proj_start + ((phase_idx - 1) * per_phase_days),
        planned_end   = proj_start + (phase_idx * per_phase_days) - 1,
        status = CASE
          WHEN phase_idx < cur_phase_idx THEN 'completed'::phase_status
          WHEN phase_idx = cur_phase_idx AND proj_status = 'on_hold' THEN 'blocked'::phase_status
          WHEN phase_idx = cur_phase_idx THEN 'in_progress'::phase_status
          ELSE 'not_started'::phase_status
        END,
        actual_start = CASE
          WHEN phase_idx <= cur_phase_idx THEN proj_start + ((phase_idx - 1) * per_phase_days) + (random() * 2)::int
          ELSE NULL
        END,
        actual_end = CASE
          WHEN phase_idx < cur_phase_idx THEN proj_start + (phase_idx * per_phase_days) + (random() * 3)::int
          ELSE NULL
        END
      WHERE id = phase_rec.id;

      phase_idx := phase_idx + 1;
    END LOOP;
  END LOOP;
END $$;

INSERT INTO milestones (phase_id, project_id, title, description, due_date, status, created_by)
SELECT
  pp.id,
  pp.project_id,
  CASE pp.phase_name
    WHEN 'site_survey' THEN 'Complete client site walkthrough'
    WHEN 'design' THEN 'Finalize AV system design drawings'
    WHEN 'boq_quotation' THEN 'Submit BOQ to client'
    WHEN 'client_approval' THEN 'Obtain signed approval'
    WHEN 'procurement' THEN 'All major equipment delivered'
    WHEN 'installation' THEN 'Complete cabling and rack installation'
    WHEN 'programming' THEN 'Programming and integration complete'
    WHEN 'testing' THEN 'Full system QA pass'
    WHEN 'handover' THEN 'Client signoff'
    ELSE 'AMC contract activated'
  END,
  'Key milestone for ' || pp.phase_name,
  COALESCE(pp.planned_end, CURRENT_DATE + 14),
  CASE
    WHEN pp.status = 'completed' THEN 'completed'::milestone_status
    WHEN pp.status = 'in_progress' THEN 'in_progress'::milestone_status
    WHEN pp.status = 'blocked' THEN 'overdue'::milestone_status
    ELSE 'pending'::milestone_status
  END,
  '11111111-1111-1111-1111-111111111111'
FROM project_phases pp
WHERE pp.status IN ('completed', 'in_progress', 'blocked');

DO $$
DECLARE
  milestone_rec RECORD;
  user_ids UUID[] := ARRAY[
    '33333333-3333-3333-3333-333333333331',
    '33333333-3333-3333-3333-333333333332',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333334',
    '33333333-3333-3333-3333-333333333335',
    '33333333-3333-3333-3333-333333333336',
    '33333333-3333-3333-3333-333333333337',
    '33333333-3333-3333-3333-333333333338'
  ];
  task_titles TEXT[] := ARRAY[
    'Cable pull from rack to ceiling speakers',
    'Mount displays in conference room',
    'Configure DSP audio routing',
    'Test video conferencing endpoints',
    'Install ceiling microphones',
    'Program Crestron control panel',
    'Verify network connectivity',
    'Site survey photo documentation',
    'BOQ review with client procurement',
    'Order display panels from vendor',
    'Coordinate with electrical contractor',
    'Final acceptance test with client',
    'Clean up site and dispose packing',
    'Hand over user training session'
  ];
  i INT;
  task_status_val TEXT;
  rand_status NUMERIC;
BEGIN
  FOR milestone_rec IN SELECT id, phase_id, project_id, due_date, status FROM milestones LOOP
    FOR i IN 1..4 LOOP
      rand_status := random();
      task_status_val := CASE
        WHEN milestone_rec.status = 'completed' THEN 'done'
        WHEN milestone_rec.status = 'overdue' THEN 'blocked'
        WHEN rand_status < 0.5 THEN 'done'
        WHEN rand_status < 0.75 THEN 'in_progress'
        WHEN rand_status < 0.92 THEN 'todo'
        ELSE 'blocked'
      END;

      INSERT INTO tasks (
        milestone_id, phase_id, project_id, title, description,
        assigned_to, assigned_by, status, priority, due_date, completed_at
      ) VALUES (
        milestone_rec.id,
        milestone_rec.phase_id,
        milestone_rec.project_id,
        task_titles[1 + (random() * (array_length(task_titles,1) - 1))::int],
        'Task for milestone ' || milestone_rec.id,
        user_ids[1 + (random() * (array_length(user_ids,1) - 1))::int],
        '22222222-2222-2222-2222-222222222223',
        task_status_val::task_status,
        (ARRAY['low','medium','high','urgent']::task_priority[])[1 + (random() * 3)::int],
        milestone_rec.due_date - (random() * 5)::int,
        CASE WHEN task_status_val = 'done' THEN NOW() - (random() * INTERVAL '10 days') ELSE NULL END
      );
    END LOOP;
  END LOOP;
END $$;

-- Force 8 overdue tasks
UPDATE tasks SET due_date = CURRENT_DATE - 5, status = 'in_progress'
WHERE id IN (SELECT id FROM tasks WHERE status != 'done' ORDER BY random() LIMIT 8);

-- Time entries spanning last 30 days
DO $$
DECLARE
  active_users UUID[] := ARRAY[
    '22222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222223',
    '22222222-2222-2222-2222-222222222224',
    '22222222-2222-2222-2222-222222222225',
    '33333333-3333-3333-3333-333333333331',
    '33333333-3333-3333-3333-333333333332',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333334',
    '33333333-3333-3333-3333-333333333335',
    '33333333-3333-3333-3333-333333333336',
    '33333333-3333-3333-3333-333333333337',
    '33333333-3333-3333-3333-333333333338'
  ];
  cities TEXT[] := ARRAY['Mumbai','Pune','Bangalore','Hyderabad','Delhi','Ahmedabad'];
  notes_pool TEXT[] := ARRAY[
    'Completed cable runs in main conference room',
    'BOQ revision and pricing update',
    'Site visit and survey with client',
    'DSP audio configuration and tuning',
    'Display mounting and bracket installation',
    'Network setup for VC endpoints',
    'Client meeting and walkthrough',
    'Programming Crestron logic',
    'Final QA testing',
    'Documentation update'
  ];
  user_id UUID;
  entry_day DATE;
  random_proj UUID;
  random_phase UUID;
  random_city TEXT;
  random_note TEXT;
  work_h NUMERIC;
  travel_h NUMERIC;
  is_verified BOOLEAN;
  d INT;
BEGIN
  FOREACH user_id IN ARRAY active_users LOOP
    FOR d IN 0..29 LOOP
      entry_day := CURRENT_DATE - d;
      CONTINUE WHEN EXTRACT(DOW FROM entry_day) = 0;
      CONTINUE WHEN random() < 0.15;

      SELECT id INTO random_proj FROM projects WHERE status IN ('active','planning') ORDER BY random() LIMIT 1;
      SELECT id INTO random_phase FROM project_phases WHERE project_id = random_proj ORDER BY random() LIMIT 1;

      random_city := cities[1 + (random() * (array_length(cities,1) - 1))::int];
      random_note := notes_pool[1 + (random() * (array_length(notes_pool,1) - 1))::int];
      work_h := 4 + (random() * 5)::numeric(4,2);
      travel_h := (random() * 3)::numeric(4,2);
      is_verified := random() < 0.6;

      INSERT INTO time_entries (
        user_id, project_id, phase_id, entry_date, work_hours, travel_hours,
        city, notes, verified_by, verified_at
      ) VALUES (
        user_id, random_proj, random_phase, entry_day,
        work_h, travel_h, random_city, random_note,
        CASE WHEN is_verified THEN '22222222-2222-2222-2222-222222222223' ELSE NULL END,
        CASE WHEN is_verified THEN NOW() - (random() * INTERVAL '5 days') ELSE NULL END
      );
    END LOOP;
  END LOOP;
END $$;

DO $$
DECLARE
  cnt_users INT; cnt_projects INT; cnt_phases INT; cnt_milestones INT; cnt_tasks INT; cnt_entries INT;
BEGIN
  SELECT COUNT(*) INTO cnt_users FROM users;
  SELECT COUNT(*) INTO cnt_projects FROM projects;
  SELECT COUNT(*) INTO cnt_phases FROM project_phases;
  SELECT COUNT(*) INTO cnt_milestones FROM milestones;
  SELECT COUNT(*) INTO cnt_tasks FROM tasks;
  SELECT COUNT(*) INTO cnt_entries FROM time_entries;
  RAISE NOTICE '=== V-TECH SEED COMPLETE ===';
  RAISE NOTICE 'Users: %    Projects: %    Phases: %    Milestones: %    Tasks: %    Time Entries: %',
    cnt_users, cnt_projects, cnt_phases, cnt_milestones, cnt_tasks, cnt_entries;
END $$;
