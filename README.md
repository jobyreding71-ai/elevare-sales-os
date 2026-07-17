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

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd elevare-sales-os

# Install dependencies
npm install
# or
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Twilio (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project at https://supabase.com
2. Run migrations:
```bash
cd supabase/migrations
# Apply migrations in order
```
3. Seed the database with demo data

### Development

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod --dir=.next
```

Or connect your GitHub repo to Netlify.

### Manual Netlify Deploy

1. Build the project:
```bash
npm run build
```

2. Deploy the `.next` folder to Netlify via their dashboard.

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
│   │   └── pipeline/
│   ├── api/
│   │   ├── ai/analyze/
│   │   ├── calls/
│   │   ├── leads/
│   │   └── webhooks/twilio/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── leads/
│   └── pipeline/
├── lib/
│   ├── supabase/
│   ├── openai/
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
| `/api/ai/analyze` | POST | AI call analysis |
| `/api/webhooks/twilio` | POST | Twilio webhooks |

## License

MIT
