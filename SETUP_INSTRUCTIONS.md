# Elevare Sales OS - Database Setup

Since direct PostgreSQL connections are not available from this environment, please run the following SQL migrations in your Supabase SQL Editor.

## Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `svflkvvrenwcnskthleb`
3. Navigate to: SQL Editor → New Query

## Step 2: Run Schema Migration

Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` into the SQL Editor and click "Run".

## Step 3: Run Seed Data

After the schema migration completes, copy and paste the contents of `supabase/migrations/002_seed_data.sql` into the SQL Editor and click "Run".

## Step 4: Verify Setup

Run this query to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see these tables:
- users
- leads
- calls
- tasks
- appointments
- policies
- commissions
- lead_activities
- ai_coaching_reports

## Step 5: Update Environment Variables in Netlify

Update your Netlify environment variables:

1. Go to https://app.netlify.com
2. Navigate to: Site settings → Environment variables
3. Add/update these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://svflkvvrenwcnskthleb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
```

4. Trigger a new deployment

## Demo Login Credentials

After running the seed data, you can create an account or use the demo users:

- Email: marcus@elevaresales.com (Owner)
- Email: sarah@elevaresales.com (Agent)
- Email: james@elevaresales.com (Manager)

Note: The passwords are not set for these demo users. You'll need to use the "Forgot Password" flow or create a new account.

## Files Reference

- Schema: `/workspace/elevare-sales-os/supabase/migrations/001_initial_schema.sql`
- Seed Data: `/workspace/elevare-sales-os/supabase/migrations/002_seed_data.sql`
