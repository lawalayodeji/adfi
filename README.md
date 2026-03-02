# AdFi — Affiliate Marketing Platform

A full-stack Next.js 14 platform that simplifies Google Ads and affiliate marketing for clients.

## Features

- **Google Ads Integration** — OAuth2 login; create, pause, and sync campaigns without touching the Google Ads UI
- **Affiliate Link Engine** — Short URLs (`/go/:code`), UTM auto-injection, click tracking
- **Postback Endpoint** — Network-side conversion firing at `/api/postback`
- **Dashboard** — Stat cards, trend charts, per-campaign breakdown
- **Reports** — 7/30/90-day analytics with CSV export
- **Onboarding Wizard** — 3-step setup for new clients

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend + API | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (Google OAuth2) |
| Google Ads | `google-ads-api` npm package |

## Getting Started

### 1. Clone & install

```bash
git clone <repo>
cd ads-for-adfi
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Fill in all values in .env
```

Required values:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — random secret (`openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `GOOGLE_ADS_DEVELOPER_TOKEN` — from Google Ads API Center
- `NEXT_PUBLIC_APP_URL` — your app's public URL

### 3. Set up database

```bash
npx prisma migrate dev --name init
# or for quick dev:
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

## Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable **Google Ads API** + **Google OAuth2**
3. Create OAuth2 credentials (Web Application)
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy `Client ID` and `Client Secret` to `.env`

## Google Ads Developer Token

1. Sign in at [ads.google.com](https://ads.google.com)
2. Tools → API Center → apply for developer token
3. For testing, the **basic access** (test account) token works fine

## Postback URL Format

Give affiliate networks this URL for server-side conversion tracking:

```
https://yourdomain.com/api/postback?cid={CLICK_ID}&revenue={REVENUE}&currency=USD&secret=YOUR_POSTBACK_SECRET
```

Replace `{CLICK_ID}` and `{REVENUE}` with the network's macros.

## Project Structure

```
src/
├── app/
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth
│   │   ├── campaigns/        # CRUD + status sync
│   │   ├── links/            # Affiliate links CRUD
│   │   ├── track/[code]/     # Click redirect handler
│   │   ├── postback/         # Conversion postback
│   │   ├── analytics/        # Reporting data
│   │   └── google-ads/       # Google Ads proxy
│   ├── dashboard/            # Protected pages
│   │   ├── page.tsx          # Overview
│   │   ├── campaigns/        # Campaign list + detail
│   │   ├── links/            # Affiliate links
│   │   ├── reports/          # Analytics
│   │   └── settings/         # Google Ads + postback config
│   ├── login/                # Sign-in page
│   └── onboarding/           # First-time setup wizard
├── components/
│   ├── ui/                   # Reusable UI primitives
│   ├── layout/               # Sidebar + topbar
│   ├── dashboard/            # Stat cards, charts
│   ├── campaigns/            # Table, create dialog
│   ├── links/                # Table, create dialog
│   ├── reports/              # Chart components
│   ├── settings/             # Settings form
│   └── onboarding/           # Wizard steps
├── lib/
│   ├── prisma.ts             # DB client singleton
│   ├── auth.ts               # NextAuth config
│   ├── utils.ts              # Formatters, UTM builder
│   ├── google-ads/           # Google Ads API wrapper
│   └── tracking/             # Link creation + click/conversion recording
├── middleware.ts             # Edge: link redirects + auth guard
└── types/
    └── next-auth.d.ts        # Session type extension
prisma/
└── schema.prisma             # Full DB schema
```
