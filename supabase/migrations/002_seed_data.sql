-- Elevare Sales OS - Seed Data
-- Run this AFTER creating auth.users manually in Supabase Dashboard
-- 1. Go to Supabase Dashboard → Authentication → Users → Add user
-- 2. Create a user with your email and password
-- 3. Copy the user's ID from the auth.users table
-- 4. Replace YOUR_AUTH_UID_HERE below with that ID
-- 5. Run this SQL

-- IMPORTANT: Replace this with your actual auth.users ID
-- You can find it in Supabase Dashboard → Authentication → Users
DO $$
DECLARE
    admin_user_id UUID := 'YOUR_AUTH_UID_HERE'::UUID;
    admin_email TEXT := 'your-email@example.com';
BEGIN
    -- Check if the placeholder UUID is still there
    IF admin_user_id = '00000000-0000-0000-0000-000000000000'::UUID THEN
        RAISE NOTICE 'Please update admin_user_id with your actual auth.users ID';
    ELSE
        -- Create admin user in public.users table
        INSERT INTO public.users (id, full_name, email, role, phone, created_at, updated_at)
        VALUES (
            admin_user_id,
            'Admin User',
            admin_email,
            'owner',
            '+12085551234',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            role = 'owner',
            updated_at = NOW();

        RAISE NOTICE 'Admin user created successfully with ID: %', admin_user_id;
    END IF;
END $$;

-- Insert sample leads for demo purposes
DO $$
DECLARE
    admin_id UUID := 'YOUR_AUTH_UID_HERE'::UUID;
BEGIN
    -- Only insert if admin exists
    IF admin_id != '00000000-0000-0000-0000-000000000000'::UUID THEN
        -- Clear existing leads first (optional - remove if you want to keep existing)
        DELETE FROM lead_activities WHERE user_id = admin_id;
        DELETE FROM calls WHERE user_id = admin_id;
        DELETE FROM tasks WHERE assigned_to = admin_id;
        DELETE FROM appointments WHERE user_id = admin_id;
        DELETE FROM commissions WHERE user_id = admin_id;
        DELETE FROM policies WHERE lead_id IN (SELECT id FROM leads WHERE owner_id = admin_id);
        DELETE FROM leads WHERE owner_id = admin_id;

        -- Insert sample leads
        INSERT INTO leads (owner_id, first_name, last_name, phone, email, date_of_birth, marital_status, children_count, occupation, annual_income, state, city, zip_code, lead_source, lead_status, pipeline_stage, ai_score, notes, created_at, updated_at)
        VALUES
        (admin_id, 'Sarah', 'Johnson', '+12085551001', 'sarah.johnson@email.com', '1985-03-15', 'Married', 2, 'Healthcare Administrator', 85000, 'ID', 'Boise', '83702', 'Referral', 'active', 'appointment_scheduled', 87, 'Interested in whole life insurance for estate planning', NOW() - INTERVAL '5 days', NOW()),
        (admin_id, 'Michael', 'Chen', '+12085551002', 'michael.chen@email.com', '1978-07-22', 'Married', 3, 'Software Engineer', 125000, 'ID', 'Meridian', '83642', 'Facebook Ads', 'active', 'quoted', 92, 'High net worth, interested in IUL strategy', NOW() - INTERVAL '3 days', NOW()),
        (admin_id, 'Jennifer', 'Williams', '+12085551003', 'jennifer.w@email.com', '1990-11-08', 'Single', 0, 'Marketing Manager', 72000, 'ID', 'Nampa', '83686', 'Google Ads', 'active', 'needs_analysis', 75, 'First time buyer, needs term life coverage', NOW() - INTERVAL '7 days', NOW()),
        (admin_id, 'Robert', 'Martinez', '+12085551004', 'robert.martinez@email.com', '1972-01-30', 'Married', 4, 'Business Owner', 180000, 'ID', 'Boise', '83704', 'Referral', 'active', 'application_submitted', 95, 'Established business owner, looking for key man insurance', NOW() - INTERVAL '2 days', NOW()),
        (admin_id, 'Amanda', 'Thompson', '+12085551005', 'amanda.t@email.com', '1988-06-14', 'Divorced', 1, 'Teacher', 58000, 'ID', 'Caldwell', '83605', 'Website', 'active', 'new_lead', 68, 'Recently divorced, needs coverage for child', NOW() - INTERVAL '1 day', NOW()),
        (admin_id, 'David', 'Kim', '+12085551006', 'david.kim@email.com', '1982-09-25', 'Married', 2, 'Dentist', 210000, 'ID', 'Eagle', '83616', 'LinkedIn', 'active', 'underwriting', 88, 'Professional looking for overhead expense coverage', NOW() - INTERVAL '10 days', NOW()),
        (admin_id, 'Lisa', 'Anderson', '+12085551007', 'lisa.anderson@email.com', '1995-12-03', 'Single', 0, 'Nurse', 65000, 'ID', 'Boise', '83706', 'Facebook Ads', 'active', 'contacted', 72, 'Healthy, non-smoker, good candidate for term', NOW() - INTERVAL '4 days', NOW()),
        (admin_id, 'James', 'Wilson', '+12085551008', 'james.wilson@email.com', '1968-04-18', 'Married', 2, 'Real Estate Agent', 95000, 'ID', 'Meridian', '83642', 'Referral', 'active', 'quoted', 81, 'Self-employed, interested inVOI policy', NOW() - INTERVAL '6 days', NOW()),
        (admin_id, 'Emily', 'Brown', '+12085551009', 'emily.brown@email.com', '1992-08-07', 'Married', 1, 'Accountant', 78000, 'ID', 'Boise', '83703', 'Google Ads', 'active', 'application_sent', 84, 'Young family, needs income replacement coverage', NOW() - INTERVAL '3 days', NOW()),
        (admin_id, 'Christopher', 'Davis', '+12085551010', 'chris.davis@email.com', '1980-02-28', 'Married', 3, 'Engineer', 110000, 'ID', 'Nampa', '83686', 'Website', 'active', 'needs_analysis', 79, 'Large family, needs significant coverage', NOW() - INTERVAL '8 days', NOW()),
        (admin_id, 'Michelle', 'Garcia', '+12085551011', 'michelle.g@email.com', '1987-10-12', 'Married', 2, 'Pharmacist', 135000, 'ID', 'Boise', '83705', 'Referral', 'active', 'active_policy', 96, 'Existing client, adding dependent coverage', NOW() - INTERVAL '30 days', NOW()),
        (admin_id, 'Daniel', 'Miller', '+12085551012', 'daniel.miller@email.com', '1975-05-20', 'Single', 0, 'Financial Advisor', 145000, 'ID', 'Meridian', '83642', 'LinkedIn', 'active', 'contact_attempted', 65, 'Busy professional, hard to reach', NOW() - INTERVAL '2 days', NOW()),
        (admin_id, 'Jessica', 'Taylor', '+12085551013', 'jessica.t@email.com', '1991-07-09', 'Married', 0, 'HR Manager', 68000, 'ID', 'Boise', '83702', 'Facebook Ads', 'active', 'new_lead', 71, 'Newlywed, starting family planning', NOW() - INTERVAL '1 day', NOW()),
        (admin_id, 'Matthew', 'Moore', '+12085551014', 'matt.moore@email.com', '1983-11-25', 'Married', 2, 'Contractor', 92000, 'ID', 'Caldwell', '83605', 'Website', 'active', 'quoted', 83, 'Physical work, needs coverage before health issues', NOW() - INTERVAL '5 days', NOW()),
        (admin_id, 'Ashley', 'Jackson', '+12085551015', 'ashley.jackson@email.com', '1989-03-17', 'Single', 1, 'Paralegal', 52000, 'ID', 'Boise', '83709', 'Google Ads', 'active', 'contacted', 74, 'Single mom, needs life insurance for child', NOW() - INTERVAL '4 days', NOW());

        RAISE NOTICE 'Sample leads inserted successfully';
    ELSE
        RAISE NOTICE 'Skipping leads insertion - admin user not found';
    END IF;
END $$;

-- Insert sample tasks
DO $$
DECLARE
    admin_id UUID := 'YOUR_AUTH_UID_HERE'::UUID;
    first_lead_id UUID;
BEGIN
    IF admin_id != '00000000-0000-0000-0000-000000000000'::UUID THEN
        SELECT id INTO first_lead_id FROM leads WHERE owner_id = admin_id LIMIT 1;

        IF first_lead_id IS NOT NULL THEN
            INSERT INTO tasks (lead_id, assigned_to, title, description, due_date, priority, completed, created_at, updated_at)
            VALUES
            (first_lead_id, admin_id, 'Follow up call', 'Schedule needs analysis call with Sarah Johnson', NOW() + INTERVAL '1 day', 'high', false, NOW(), NOW()),
            (first_lead_id, admin_id, 'Send quote documents', 'Prepare and send IUL quote to Michael Chen', NOW() + INTERVAL '2 days', 'medium', false, NOW(), NOW()),
            (first_lead_id, admin_id, 'Review application', 'Review Jennifer Williams application', NOW() + INTERVAL '3 days', 'high', false, NOW(), NOW()),
            (first_lead_id, admin_id, 'Send welcome email', 'Send onboarding materials to new leads', NOW(), 'low', false, NOW(), NOW());

            RAISE NOTICE 'Sample tasks inserted successfully';
        END IF;
    END IF;
END $$;

-- Insert sample appointments
DO $$
DECLARE
    admin_id UUID := 'YOUR_AUTH_UID_HERE'::UUID;
    lead_id1 UUID;
    lead_id2 UUID;
    lead_id3 UUID;
BEGIN
    IF admin_id != '00000000-0000-0000-0000-000000000000'::UUID THEN
        SELECT id INTO lead_id1 FROM leads WHERE owner_id = admin_id AND first_name = 'Sarah' LIMIT 1;
        SELECT id INTO lead_id2 FROM leads WHERE owner_id = admin_id AND first_name = 'Robert' LIMIT 1;
        SELECT id INTO lead_id3 FROM leads WHERE owner_id = admin_id AND first_name = 'Emily' LIMIT 1;

        IF lead_id1 IS NOT NULL AND lead_id2 IS NOT NULL AND lead_id3 IS NOT NULL THEN
            INSERT INTO appointments (lead_id, user_id, appointment_type, start_time, end_time, location, notes, status, created_at)
            VALUES
            (lead_id1, admin_id, 'Needs Analysis', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'Zoom', 'Initial needs analysis - estate planning focus', 'scheduled', NOW()),
            (lead_id2, admin_id, 'Application Review', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '30 minutes', 'Coffee Shop - Boise', 'Review and sign application documents', 'scheduled', NOW()),
            (lead_id3, admin_id, 'Final Interview', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', 'Phone Call', 'Final underwriting questions', 'scheduled', NOW());

            RAISE NOTICE 'Sample appointments inserted successfully';
        END IF;
    END IF;
END $$;

-- Insert sample policies
DO $$
DECLARE
    admin_id UUID := 'YOUR_AUTH_UID_HERE'::UUID;
    lead_id1 UUID;
    lead_id2 UUID;
BEGIN
    IF admin_id != '00000000-0000-0000-0000-000000000000'::UUID THEN
        SELECT id INTO lead_id1 FROM leads WHERE owner_id = admin_id AND first_name = 'Michelle' LIMIT 1;
        SELECT id INTO lead_id2 FROM leads WHERE owner_id = admin_id AND first_name = 'David' LIMIT 1;

        IF lead_id1 IS NOT NULL THEN
            INSERT INTO policies (lead_id, carrier, product_type, face_amount, annual_premium, application_date, issue_date, policy_status, chargeback_risk, created_at, updated_at)
            VALUES
            (lead_id1, 'Nationwide', 'Whole Life', 500000, 8500, NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days', 'in_force', false, NOW() - INTERVAL '25 days', NOW()),
            (lead_id2, 'Pacific Life', 'IUL', 1000000, 12000, NOW() - INTERVAL '8 days', NULL, 'pending', false, NOW() - INTERVAL '8 days', NOW());

            RAISE NOTICE 'Sample policies inserted successfully';
        END IF;
    END IF;
END $$;

-- Insert sample commissions
DO $$
DECLARE
    admin_id UUID := 'YOUR_AUTH_UID_HERE'::UUID;
    policy_id1 UUID;
    policy_id2 UUID;
BEGIN
    IF admin_id != '00000000-0000-0000-0000-000000000000'::UUID THEN
        SELECT id INTO policy_id1 FROM policies WHERE lead_id IN (SELECT id FROM leads WHERE owner_id = admin_id AND first_name = 'Michelle') LIMIT 1;
        SELECT id INTO policy_id2 FROM policies WHERE lead_id IN (SELECT id FROM leads WHERE owner_id = admin_id AND first_name = 'David') LIMIT 1;

        IF policy_id1 IS NOT NULL THEN
            INSERT INTO commissions (policy_id, user_id, gross_premium, commission_rate, advance_amount, renewal_amount, paid_amount, paid_date, chargeback_amount, commission_status, created_at, updated_at)
            VALUES
            (policy_id1, admin_id, 8500, 55, 4675, 425, 4675, NOW() - INTERVAL '15 days', 0, 'paid', NOW() - INTERVAL '20 days', NOW()),
            (policy_id1, admin_id, 8500, 55, 0, 425, 0, NULL, 0, 'pending', NOW() - INTERVAL '5 days', NOW());

            RAISE NOTICE 'Sample commissions inserted successfully';
        END IF;

        IF policy_id2 IS NOT NULL THEN
            INSERT INTO commissions (policy_id, user_id, gross_premium, commission_rate, advance_amount, renewal_amount, paid_amount, paid_date, chargeback_amount, commission_status, created_at, updated_at)
            VALUES
            (policy_id2, admin_id, 12000, 60, 7200, 600, 0, NULL, 0, 'pending', NOW() - INTERVAL '8 days', NOW());

            RAISE NOTICE 'Sample commissions for pending policy inserted successfully';
        END IF;
    END IF;
END $$;

-- Insert sample call records
DO $$
DECLARE
    admin_id UUID := 'YOUR_AUTH_UID_HERE'::UUID;
    lead_id1 UUID;
    lead_id2 UUID;
BEGIN
    IF admin_id != '00000000-0000-0000-0000-000000000000'::UUID THEN
        SELECT id INTO lead_id1 FROM leads WHERE owner_id = admin_id AND first_name = 'Sarah' LIMIT 1;
        SELECT id INTO lead_id2 FROM leads WHERE owner_id = admin_id AND first_name = 'Michael' LIMIT 1;

        IF lead_id1 IS NOT NULL THEN
            INSERT INTO calls (lead_id, user_id, duration_seconds, sentiment_score, ai_summary, created_at)
            VALUES
            (lead_id1, admin_id, 1245, 78, 'Sarah is interested in whole life insurance for estate planning. She has a medium-sized estate and wants to ensure her children are protected. She mentioned her husband is supportive of the decision. Follow up with a detailed quote.', NOW() - INTERVAL '3 days'),
            (lead_id1, admin_id, 890, 82, 'Great progress on the needs analysis. Sarah confirmed coverage amount of $500K. She has existing coverage through work that she wants to supplement. Scheduling in-person meeting next week.', NOW() - INTERVAL '1 day');

            RAISE NOTICE 'Sample calls inserted successfully';
        END IF;

        IF lead_id2 IS NOT NULL THEN
            INSERT INTO calls (lead_id, user_id, duration_seconds, sentiment_score, ai_summary, created_at)
            VALUES
            (lead_id2, admin_id, 2100, 91, 'Michael is a high-net-worth prospect interested in IUL strategy. He has significant assets and wants tax-advantaged growth. Very receptive to the concept. Will need sophisticated illustration.', NOW() - INTERVAL '2 days');

            RAISE NOTICE 'Sample call for Michael inserted successfully';
        END IF;
    END IF;
END $$;

-- Insert sample lead activities
DO $$
DECLARE
    admin_id UUID := 'YOUR_AUTH_UID_HERE'::UUID;
    lead_id1 UUID;
    lead_id2 UUID;
BEGIN
    IF admin_id != '00000000-0000-0000-0000-000000000000'::UUID THEN
        SELECT id INTO lead_id1 FROM leads WHERE owner_id = admin_id LIMIT 1;
        SELECT id INTO lead_id2 FROM leads WHERE owner_id = admin_id OFFSET 1 LIMIT 1;

        IF lead_id1 IS NOT NULL THEN
            INSERT INTO lead_activities (lead_id, user_id, activity_type, content, metadata, created_at)
            VALUES
            (lead_id1, admin_id, 'note', 'Initial contact established. Left voicemail with callback number.', '{"source": "outbound"}', NOW() - INTERVAL '5 days'),
            (lead_id1, admin_id, 'call', 'Successful first contact. Scheduled needs analysis appointment.', '{"duration": 1245, "outcome": "scheduled"}', NOW() - INTERVAL '3 days'),
            (lead_id1, admin_id, 'email', 'Sent welcome packet and intake forms.', '{"template": "welcome_packet"}', NOW() - INTERVAL '2 days'),
            (lead_id1, admin_id, 'stage_change', 'Lead moved to Appointment Scheduled stage.', '{"from": "contacted", "to": "appointment_scheduled"}', NOW() - INTERVAL '1 day'),
            (lead_id1, admin_id, 'appointment', 'Needs Analysis appointment completed. Very productive session.', '{"type": "needs_analysis", "duration": 60}', NOW()),
            (lead_id1, admin_id, 'ai_action', 'AI suggested follow-up: Send estate planning questionnaire.', '{"suggestion_type": "follow_up", "priority": "high"}', NOW());

            RAISE NOTICE 'Sample activities inserted successfully';
        END IF;
    END IF;
END $$;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Elevare Sales OS - Seed Data Complete!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update the admin_user_id in this script with your auth.users ID';
    RAISE NOTICE '2. If you see "YOUR_AUTH_UID_HERE", create a user in Supabase Dashboard first';
    RAISE NOTICE '3. Re-run this script after updating the ID';
    RAISE NOTICE '';
END $$;
