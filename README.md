# Elevare Sales OS

AI-Powered CRM and Sales Operating System for Life Insurance Agents

## Features

- **Lead Management** - Capture, organize, and score leads with AI
- **AI Call Analysis** - Transcribe and analyze calls automatically
- **Pipeline Management** - Drag-and-drop Kanban board with 12 stages
- **Commission Tracking** - Track commissions, renewals, and chargebacks
- **AI Sales Coach** - Get personalized coaching after every call
- **Automation Engine** - Workflow automations for follow-ups

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI**: OpenAI API for call analysis and coaching
- **Deployment**: Vercel (recommended) or Netlify

---

## Quick Start Guide (Admin Setup)

This app is designed for **personal use** with direct admin access - no trials, no limits.

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**
3. Set:
   - **Name**: Elevare Sales OS
   - **Database Password**: (copy this, you'll need it)
   - **Region**: Choose closest to you
4. Click **Create new project** and wait for setup (2-3 minutes)

### Step 2: Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public** key under "Project API keys"
   - **service_role** key (click "Reveal" to see it)

### Step 3: Set Up Database Schema

1. Go to **SQL Editor** in Supabase
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run** to create all tables

### Step 4: Create Your Admin Account

**Option A: Through Supabase Dashboard (Recommended)**

1. Go to **Authentication** → **Users** → **Add user**
2. Set your email and password
3. Click **Create user**
4. **IMPORTANT**: Copy the user's **ID** from the user list (UUID format)

**Option B: Through SQL (Advanced)**

```sql
-- First create auth user via Dashboard, then run:
INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'your-email@example.com',
  crypt('your-password', gen_salt('bf')),
  '{"full_name": "Your Name"}'
);
```

### Step 5: Link Your Auth User to the App

1. Open `supabase/migrations/002_seed_data.sql`
2. Find `YOUR_AUTH_UID_HERE` and replace with your actual user ID
3. Also update `your-email@example.com` with your email
4. Run the updated SQL in **SQL Editor**

### Step 6: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **Add New** → **Project**
3. Import your GitHub repo (or push the code first)
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**

### Step 7: Log In

1. Go to your Vercel URL
2. Click **Sign In**
3. Enter your email and password
4. You're in! Full admin access with no trial.

---

## Local Development

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase CLI (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/jobyreding71-ai/elevare-sales-os.git
cd elevare-sales-os

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Twilio (optional - for calls/SMS)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema Overview

```
users ──────────┐
  │             │
  ▼             │
leads ◄─────────┼─────────► leads_activities
  │             │
  ├──► calls    │
  │             │
  ├──► tasks    │
  │             │
  ├──► appointments
  │             │
  └──► policies ◄─┴──► commissions
                      │
                      ▼
               ai_coaching_reports
                      ▲
                      │
               calls ──┘
```

### Tables

| Table | Description |
|-------|-------------|
| `users` | Agent profiles with roles (owner, agent, manager, admin) |
| `leads` | Prospect information with AI scoring |
| `calls` | Call records with AI transcripts and summaries |
| `tasks` | Follow-up tasks with due dates and priorities |
| `appointments` | Scheduled meetings with leads |
| `policies` | Insurance policies and applications |
| `commissions` | Commission tracking and renewals |
| `lead_activities` | Activity timeline for each lead |
| `ai_coaching_reports` | AI-generated coaching feedback |

---

## Deployment Options

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=.next
```

---

## Project Structure

```
elevare-sales-os/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── leads/
│   │   │   └── [id]/
│   │   ├── pipeline/
│   │   └── commissions/
│   ├── api/
│   │   ├── ai/analyze/
│   │   ├── calls/
│   │   ├── leads/
│   │   └── webhooks/twilio/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── supabase/
│   ├── hooks/
│   └── utils/
├── supabase/
│   └── migrations/
└── public/
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/leads` | GET, POST | List/Create leads |
| `/api/leads/[id]` | GET, PATCH, DELETE | Lead operations |
| `/api/calls` | GET, POST | List/Create calls |
| `/api/tasks` | GET, POST | Task management |
| `/api/appointments` | GET, POST, PATCH | Appointments |
| `/api/policies` | GET, POST | Policy management |
| `/api/ai/analyze` | POST | AI call analysis |
| `/api/webhooks/twilio` | POST | Twilio webhooks |

---

## Troubleshooting

### "Missing Supabase environment variables"

1. Make sure `.env.local` exists with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Restart the dev server after adding env vars

### "User not found" after login

1. Go to Supabase Dashboard → SQL Editor
2. Run: `SELECT id, email FROM auth.users;`
3. If your user exists, check that the `public.users` table has a matching record
4. The `public.users.id` must match `auth.users.id`

### Database migration errors

1. Check that RLS is enabled on all tables
2. Make sure the `uuid-ossp` extension is enabled
3. Try running migrations one at a time

---

## License

MIT
