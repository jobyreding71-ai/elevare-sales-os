# Database Setup Instructions for Supabase

## Step 1: Run SQL in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/svflkvvrenwcnskthleb
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `001_initial_schema.sql` (all the SQL)
5. Click **Run** to execute

## Step 2: Enable Email Auth (Optional but Recommended)

1. Go to **Authentication** → **Settings**
2. Under **Email**, ensure **Enable Email Signup** is ON
3. Configure **Site URL** and **Redirect URLs** as needed

## Step 3: Get Service Role Key (for server-side operations)

1. Go to **Settings** → **API**
2. Find **service_role** key under "Project API keys"
3. Copy it and update your `.env.local` file:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Files to Run

- `001_initial_schema.sql` - Complete database schema with tables, indexes, and RLS policies
