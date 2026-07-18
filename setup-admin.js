#!/usr/bin/env node
/**
 * Elevare Sales OS - Admin Setup Script
 *
 * This script helps you set up your admin account and seed demo data.
 *
 * Usage:
 *   node setup-admin.js <SUPABASE_URL> <SERVICE_ROLE_KEY> <YOUR_EMAIL> <YOUR_PASSWORD>
 *
 * Example:
 *   node setup-admin.js https://xxxx.supabase.co eyJhbGc... your@email.com yourpassword123
 */

const { Client } = require('pg');

const args = process.argv.slice(2);

if (args.length < 4) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Elevare Sales OS - Admin Setup Script                 ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node setup-admin.js <SUPABASE_URL> <SERVICE_ROLE_KEY> <YOUR_EMAIL> <YOUR_PASSWORD>

Example:
  node setup-admin.js https://xxxx.supabase.co eyJhbGc... your@email.com yourpassword123

Steps:
1. Create a Supabase project at https://supabase.com
2. Go to Settings → API to get your URL and service role key
3. Run this script with your credentials

What this does:
- Creates your admin user account
- Sets up 15 sample Idaho leads
- Adds sample tasks, appointments, and policies
- Creates commission records
- Adds activity history

`);
  process.exit(1);
}

const [supabaseUrl, serviceRoleKey, userEmail, userPassword] = args;

async function setup() {
  console.log('\n🔧 Elevare Sales OS - Setting up your admin account...\n');

  // Extract host from URL
  const url = new URL(supabaseUrl);
  const host = url.hostname;

  const client = new Client({
    host: host,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase!\n');

    // Step 1: Create auth user
    console.log('📝 Step 1: Creating your admin user...');

    const userId = require('crypto').randomUUID();

    // Insert into auth.users
    const insertAuthUser = `
      INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, email_confirmed_at)
      VALUES ($1::uuid, $2, crypt($3, gen_salt('bf')), $4, NOW())
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `;

    const result = await client.query(insertAuthUser, [
      userId,
      userEmail,
      userPassword,
      JSON.stringify({ full_name: 'Admin User', role: 'owner' })
    ]);

    if (result.rows.length > 0) {
      console.log('   ✅ Auth user created');
    } else {
      // User already exists, get the ID
      const existingUser = await client.query(
        'SELECT id FROM auth.users WHERE email = $1',
        [userEmail]
      );
      if (existingUser.rows.length > 0) {
        const { id } = existingUser.rows[0];
        console.log(`   ℹ️  User already exists with ID: ${id}`);
      }
    }

    // Step 2: Get user ID (either newly created or existing)
    const userResult = await client.query(
      'SELECT id FROM auth.users WHERE email = $1',
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Failed to create or find user');
    }

    const adminId = userResult.rows[0].id;
    console.log(`   User ID: ${adminId}`);

    // Step 3: Create public.users record
    console.log('\n📝 Step 2: Linking user to app...');

    const insertPublicUser = `
      INSERT INTO public.users (id, full_name, email, role, phone, created_at, updated_at)
      VALUES ($1::uuid, $2, $3, 'owner', '+12085551234', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = 'owner',
        updated_at = NOW()
      RETURNING id;
    `;

    await client.query(insertPublicUser, [adminId, 'Admin User', userEmail]);
    console.log('   ✅ User linked to app with OWNER role');

    // Step 4: Clear existing demo data
    console.log('\n🗑️  Step 3: Clearing existing demo data...');

    await client.query('DELETE FROM lead_activities WHERE user_id = $1::uuid', [adminId]);
    await client.query('DELETE FROM calls WHERE user_id = $1::uuid', [adminId]);
    await client.query('DELETE FROM tasks WHERE assigned_to = $1::uuid', [adminId]);
    await client.query('DELETE FROM appointments WHERE user_id = $1::uuid', [adminId]);
    await client.query('DELETE FROM commissions WHERE user_id = $1::uuid', [adminId]);
    await client.query('DELETE FROM policies WHERE lead_id IN (SELECT id FROM leads WHERE owner_id = $1::uuid)', [adminId]);
    await client.query('DELETE FROM leads WHERE owner_id = $1::uuid', [adminId]);
    console.log('   ✅ Existing data cleared');

    // Step 5: Insert sample leads
    console.log('\n📝 Step 4: Creating sample Idaho leads...');

    const insertLeads = `
      INSERT INTO leads (owner_id, first_name, last_name, phone, email, date_of_birth, marital_status, children_count, occupation, annual_income, state, city, zip_code, lead_source, lead_status, pipeline_stage, ai_score, notes, created_at, updated_at)
      VALUES
      ($1::uuid, 'Sarah', 'Johnson', '+12085551001', 'sarah.johnson@email.com', '1985-03-15', 'Married', 2, 'Healthcare Administrator', 85000, 'ID', 'Boise', '83702', 'Referral', 'active', 'appointment_scheduled', 87, 'Interested in whole life for estate planning', NOW() - INTERVAL '5 days', NOW()),
      ($1::uuid, 'Michael', 'Chen', '+12085551002', 'michael.chen@email.com', '1978-07-22', 'Married', 3, 'Software Engineer', 125000, 'ID', 'Meridian', '83642', 'Facebook Ads', 'active', 'quoted', 92, 'High net worth, interested in IUL', NOW() - INTERVAL '3 days', NOW()),
      ($1::uuid, 'Jennifer', 'Williams', '+12085551003', 'jennifer.w@email.com', '1990-11-08', 'Single', 0, 'Marketing Manager', 72000, 'ID', 'Nampa', '83686', 'Google Ads', 'active', 'needs_analysis', 75, 'First time buyer, needs term coverage', NOW() - INTERVAL '7 days', NOW()),
      ($1::uuid, 'Robert', 'Martinez', '+12085551004', 'robert.martinez@email.com', '1972-01-30', 'Married', 4, 'Business Owner', 180000, 'ID', 'Boise', '83704', 'Referral', 'active', 'application_submitted', 95, 'Looking for key man insurance', NOW() - INTERVAL '2 days', NOW()),
      ($1::uuid, 'Amanda', 'Thompson', '+12085551005', 'amanda.t@email.com', '1988-06-14', 'Divorced', 1, 'Teacher', 58000, 'ID', 'Caldwell', '83605', 'Website', 'active', 'new_lead', 68, 'Recently divorced, needs coverage for child', NOW() - INTERVAL '1 day', NOW()),
      ($1::uuid, 'David', 'Kim', '+12085551006', 'david.kim@email.com', '1982-09-25', 'Married', 2, 'Dentist', 210000, 'ID', 'Eagle', '83616', 'LinkedIn', 'active', 'underwriting', 88, 'Professional, overhead expense coverage', NOW() - INTERVAL '10 days', NOW()),
      ($1::uuid, 'Lisa', 'Anderson', '+12085551007', 'lisa.anderson@email.com', '1995-12-03', 'Single', 0, 'Nurse', 65000, 'ID', 'Boise', '83706', 'Facebook Ads', 'active', 'contacted', 72, 'Healthy non-smoker, good for term', NOW() - INTERVAL '4 days', NOW()),
      ($1::uuid, 'James', 'Wilson', '+12085551008', 'james.wilson@email.com', '1968-04-18', 'Married', 2, 'Real Estate Agent', 95000, 'ID', 'Meridian', '83642', 'Referral', 'active', 'quoted', 81, 'Self-employed, VOI policy interest', NOW() - INTERVAL '6 days', NOW()),
      ($1::uuid, 'Emily', 'Brown', '+12085551009', 'emily.brown@email.com', '1992-08-07', 'Married', 1, 'Accountant', 78000, 'ID', 'Boise', '83703', 'Google Ads', 'active', 'application_sent', 84, 'Young family, income replacement', NOW() - INTERVAL '3 days', NOW()),
      ($1::uuid, 'Christopher', 'Davis', '+12085551010', 'chris.davis@email.com', '1980-02-28', 'Married', 3, 'Engineer', 110000, 'ID', 'Nampa', '83686', 'Website', 'active', 'needs_analysis', 79, 'Large family, significant coverage', NOW() - INTERVAL '8 days', NOW()),
      ($1::uuid, 'Michelle', 'Garcia', '+12085551011', 'michelle.g@email.com', '1987-10-12', 'Married', 2, 'Pharmacist', 135000, 'ID', 'Boise', '83705', 'Referral', 'active', 'active_policy', 96, 'Existing client, adding coverage', NOW() - INTERVAL '30 days', NOW()),
      ($1::uuid, 'Daniel', 'Miller', '+12085551012', 'daniel.miller@email.com', '1975-05-20', 'Single', 0, 'Financial Advisor', 145000, 'ID', 'Meridian', '83642', 'LinkedIn', 'active', 'contact_attempted', 65, 'Busy professional, hard to reach', NOW() - INTERVAL '2 days', NOW()),
      ($1::uuid, 'Jessica', 'Taylor', '+12085551013', 'jessica.t@email.com', '1991-07-09', 'Married', 0, 'HR Manager', 68000, 'ID', 'Boise', '83702', 'Facebook Ads', 'active', 'new_lead', 71, 'Newlywed, family planning', NOW() - INTERVAL '1 day', NOW()),
      ($1::uuid, 'Matthew', 'Moore', '+12085551014', 'matt.moore@email.com', '1983-11-25', 'Married', 2, 'Contractor', 92000, 'ID', 'Caldwell', '83605', 'Website', 'active', 'quoted', 83, 'Physical work, needs coverage soon', NOW() - INTERVAL '5 days', NOW()),
      ($1::uuid, 'Ashley', 'Jackson', '+12085551015', 'ashley.jackson@email.com', '1989-03-17', 'Single', 1, 'Paralegal', 52000, 'ID', 'Boise', '83709', 'Google Ads', 'active', 'contacted', 74, 'Single mom, needs life insurance', NOW() - INTERVAL '4 days', NOW());
    `;

    await client.query(insertLeads, [adminId]);
    console.log('   ✅ 15 sample leads created');

    // Step 6: Get lead IDs for related data
    const leads = await client.query(
      'SELECT id, first_name FROM leads WHERE owner_id = $1::uuid ORDER BY created_at LIMIT 3',
      [adminId]
    );

    const leadIds = leads.rows;

    // Step 7: Create sample tasks
    console.log('\n📝 Step 5: Creating sample tasks...');

    const insertTasks = `
      INSERT INTO tasks (lead_id, assigned_to, title, description, due_date, priority, completed, created_at, updated_at)
      VALUES
      ($1::uuid, $2::uuid, 'Follow up call', 'Schedule needs analysis call with Sarah', NOW() + INTERVAL '1 day', 'high', false, NOW(), NOW()),
      ($1::uuid, $2::uuid, 'Send quote documents', 'Prepare IUL quote for Michael Chen', NOW() + INTERVAL '2 days', 'medium', false, NOW(), NOW()),
      ($2::uuid, $2::uuid, 'Send welcome email', 'Send onboarding materials to new leads', NOW(), 'low', false, NOW(), NOW());
    `;

    await client.query(insertTasks, [leadIds[0]?.id || '00000000-0000-0000-0000-000000000000', adminId]);
    console.log('   ✅ Sample tasks created');

    // Step 8: Create sample appointments
    console.log('\n📝 Step 6: Creating sample appointments...');

    if (leadIds.length >= 2) {
      const insertAppts = `
        INSERT INTO appointments (lead_id, user_id, appointment_type, start_time, end_time, location, notes, status, created_at)
        VALUES
        ($1::uuid, $3::uuid, 'Needs Analysis', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'Zoom', 'Estate planning focus', 'scheduled', NOW()),
        ($2::uuid, $3::uuid, 'Application Review', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '30 minutes', 'Coffee Shop - Boise', 'Review application docs', 'scheduled', NOW());
      `;

      await client.query(insertAppts, [leadIds[0].id, leadIds[1].id, adminId]);
      console.log('   ✅ Sample appointments created');
    }

    // Step 9: Create sample policies
    console.log('\n📝 Step 7: Creating sample policies...');

    // Find Michelle (has active policy)
    const michelleLead = await client.query(
      "SELECT id FROM leads WHERE owner_id = $1::uuid AND first_name = 'Michelle'",
      [adminId]
    );

    if (michelleLead.rows.length > 0) {
      const insertPolicy = `
        INSERT INTO policies (lead_id, carrier, product_type, face_amount, annual_premium, application_date, issue_date, policy_status, chargeback_risk, created_at, updated_at)
        VALUES ($1::uuid, 'Nationwide', 'Whole Life', 500000, 8500, NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days', 'in_force', false, NOW() - INTERVAL '25 days', NOW())
        RETURNING id;
      `;

      const policyResult = await client.query(insertPolicy, [michelleLead.rows[0].id]);
      const policyId = policyResult.rows[0].id;

      // Create commission record
      const insertCommission = `
        INSERT INTO commissions (policy_id, user_id, gross_premium, commission_rate, advance_amount, renewal_amount, paid_amount, paid_date, chargeback_amount, commission_status, created_at, updated_at)
        VALUES ($1::uuid, $2::uuid, 8500, 55, 4675, 425, 4675, NOW() - INTERVAL '15 days', 0, 'paid', NOW() - INTERVAL '20 days', NOW());
      `;

      await client.query(insertCommission, [policyId, adminId]);
      console.log('   ✅ Sample policy and commission created');
    }

    // Step 10: Create sample calls
    console.log('\n📝 Step 8: Creating sample call records...');

    if (leadIds.length > 0) {
      const insertCall = `
        INSERT INTO calls (lead_id, user_id, duration_seconds, sentiment_score, ai_summary, created_at)
        VALUES
        ($1::uuid, $2::uuid, 1245, 78, 'Sarah interested in whole life for estate planning. Medium estate, wants children protected. Follow up with detailed quote.', NOW() - INTERVAL '3 days'),
        ($1::uuid, $2::uuid, 890, 82, 'Great progress. Sarah confirmed $500K coverage. Scheduling in-person meeting.', NOW() - INTERVAL '1 day');
      `;

      await client.query(insertCall, [leadIds[0].id, adminId]);
      console.log('   ✅ Sample calls created');
    }

    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ✅ Setup Complete!                         ║
╚════════════════════════════════════════════════════════════════╝

Your admin account is ready!

📧 Email: ${userEmail}
🔑 Role: Owner (full admin access)

Next steps:
1. Deploy to Vercel:
   - Go to https://vercel.com
   - Import your GitHub repo
   - Add environment variables:
     NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
   - Deploy!

2. Log in at your Vercel URL with:
   📧 ${userEmail}
   🔐 Your password

You have:
• 15 sample Idaho leads
• Sample tasks and appointments
• 1 active policy with commission
• Call records and activity history

Good luck with Elevare Sales OS! 🚀
`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nMake sure you:');
    console.error('1. Created the database schema first (run 001_initial_schema.sql)');
    console.error('2. Have the correct service role key');
    console.error('3. Have a valid Supabase URL');
    process.exit(1);
  } finally {
    await client.end();
  }
}

setup();
