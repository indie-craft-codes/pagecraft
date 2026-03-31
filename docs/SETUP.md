# PageCraft - Setup Guide

## Overview

PageCraft is an AI-powered landing page generator SaaS. Users describe their product and AI generates a complete, responsive landing page with optimized copy.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Auth & Database**: Supabase
- **Payments**: Stripe
- **AI**: Claude API (Anthropic)
- **Deployment**: Vercel

---

## 1. Prerequisites

- Node.js 18+
- npm
- Supabase account (free tier works)
- Stripe account (test mode)
- Anthropic API key

---

## 2. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** (Settings → API)

### Run Migration

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the contents of `supabase/migrations/001_init.sql`
3. Run the SQL

This creates:
- `profiles` table (linked to auth.users)
- `projects` table (stores landing pages)
- RLS policies for security
- Auto-profile creation trigger
- Monthly page count reset function

### Enable Auth Providers

1. Go to **Authentication → Providers**
2. Enable **Email** (enabled by default)
3. (Optional) Enable **Google OAuth**:
   - Create OAuth credentials in Google Cloud Console
   - Add the Client ID and Secret in Supabase
   - Set redirect URL: `https://your-domain.com/callback`

### Set up Monthly Reset (Optional)

To reset free users' page count monthly:
1. Go to **Database → Extensions** → Enable `pg_cron`
2. Run in SQL Editor:
```sql
select cron.schedule(
  'reset-monthly-pages',
  '0 0 1 * *',
  $$select public.reset_monthly_page_count()$$
);
```

---

## 3. Stripe Setup

### Create Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Create **Pro** product:
   - Price: $19/month (recurring)
   - Note the Price ID (`price_xxx`)
3. Create **Team** product:
   - Price: $49/month (recurring)
   - Note the Price ID (`price_xxx`)

### Set up Webhook

1. Go to **Developers → Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Note the Webhook Secret (`whsec_xxx`)

### For Local Development

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 4. Anthropic API

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add credits to your account (AI generation costs ~$0.01-0.05 per page)

---

## 5. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Where to find |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks |
| `STRIPE_PRO_PRICE_ID` | Stripe → Products → Pro → Price ID |
| `STRIPE_TEAM_PRICE_ID` | Stripe → Products → Team → Price ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API Keys |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (dev) or your domain |

---

## 6. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

---

## 7. Deploy to Vercel

1. Push code to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy

### Custom Domain

1. Add domain in Vercel → Settings → Domains
2. Update `NEXT_PUBLIC_APP_URL` env variable
3. Update Supabase redirect URLs
4. Update Stripe webhook URL

---

## Project Structure

```
pagecraft/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, Signup, OAuth callback
│   │   ├── (app)/           # Dashboard, Editor, Settings (protected)
│   │   ├── api/             # API routes (generate, billing, webhooks)
│   │   ├── p/[slug]/        # Public published pages
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Marketing landing page
│   ├── components/
│   │   └── ui/              # Reusable UI components
│   ├── lib/
│   │   ├── supabase/        # Supabase client (browser, server, middleware)
│   │   ├── ai.ts            # Claude API integration
│   │   ├── stripe.ts        # Stripe config & plans
│   │   └── utils.ts         # Utility functions
│   ├── types/               # TypeScript types
│   └── middleware.ts         # Auth middleware
├── supabase/
│   └── migrations/          # Database migration SQL
├── docs/
│   └── SETUP.md             # This file
└── .env.example             # Environment template
```

---

## Revenue Model

| Plan | Price | Limits |
|------|-------|--------|
| Free | $0 | 1 page/month, PageCraft branding |
| Pro | $19/mo | Unlimited pages, no branding, custom domains |
| Team | $49/mo | Everything in Pro + collaboration, API, analytics |

---

## Key Features

- **AI Page Generation**: Claude API generates complete HTML landing pages
- **Live Editor**: Preview + code editor with responsive device switching
- **One-Click Publish**: Pages published at `/p/[slug]`
- **HTML Export**: Download generated pages as HTML files
- **Stripe Billing**: Subscription management with customer portal
- **Auth**: Email/password + Google OAuth via Supabase
- **RLS Security**: Row-level security on all database tables
