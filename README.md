<div align="center">

<img src="public/logo.png" alt="LinkPilot" width="360" />

**Campaign link management for freelancers, small businesses, and agencies.**

Short links, QR codes, click analytics, and client-ready reports — in one dashboard.

[Features](#features) · [Tech stack](#tech-stack) · [Getting started](#getting-started) · [Environment variables](#environment-variables) · [Project structure](#project-structure)

</div>

---

## What is LinkPilot?

Most people share links and never know what happened next. LinkPilot turns every link into a **trackable asset**: create a short link for each channel, group them into a campaign, and send clients or teammates a live report — no login, no screenshots, no spreadsheets.

- **No account needed to try it** — the homepage shortener creates a temporary link with expiry, password protection, and a QR code in seconds.
- **Free dashboard accounts** get 50 permanent links and 2 campaigns with full analytics — no credit card required.
- **Paid plans** unlock unlimited links/campaigns, branded custom domains, client portals, white-labeled reports, and scheduled report emails — built for people who bill clients for their work.

## Features

**Public / guest tool**
- Instant short links with optional expiry and password protection
- Auto-generated QR code, downloadable as PNG
- No sign-up required, rate-limited to prevent abuse

**Link management**
- Custom slugs, notes, tags, click limits, A/B redirect variants
- Password protection, scheduled expiry, pause/resume
- Open Graph tag overrides for social previews
- QR code customizer — brand colors and logo overlay

**Campaigns & analytics**
- Group links into campaigns with shared reporting
- Clicks over time, device/browser/OS breakdown, referrers, geography
- Unique click deduplication and top-link/top-campaign rankings
- Printable and shareable (token-based, read-only) campaign reports

**Agency features**
- Branded custom domains (per-workspace)
- Client portals — token-based, no login required for clients
- White-labeled reports (logo, brand color, optional "powered by" removal)
- Scheduled report emails (weekly/monthly, via cron)
- Geo & campaign templates for repeatable setups

**Platform**
- Email/password and Google OAuth authentication, with email verification and password reset
- Workspaces with role-based membership (Owner/Admin/Member)
- Stripe-powered subscriptions (Starter / Pro) with a self-serve billing portal
- Guided onboarding wizard for new accounts
- Image uploads via Cloudinary (avatars, brand logos)

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Database | PostgreSQL ([Neon](https://neon.tech)) via [Prisma 7](https://www.prisma.io) |
| Auth | [NextAuth v4](https://next-auth.js.org) (credentials + Google OAuth) |
| Payments | [Stripe](https://stripe.com) (subscriptions + customer portal) |
| Email | [Resend](https://resend.com) |
| Media | [Cloudinary](https://cloudinary.com) |
| Validation | [Zod](https://zod.dev) |

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (this project is built and tested against [Neon](https://neon.tech))

### Setup

```bash
# install dependencies
npm install

# copy env vars and fill in the values (see below)
cp .env.example .env

# generate the Prisma client and push the schema
npx prisma generate
npx prisma db push

# start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the homepage works immediately with the guest shortener; the dashboard requires the environment variables below.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Base URL used by NextAuth (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Session encryption secret |
| `APP_HASH_SECRET` | Secret used to hash short-link tokens |
| `APP_DOMAIN` / `NEXT_PUBLIC_APP_HOST` / `NEXT_PUBLIC_APP_URL` | Canonical app domain/URL used for generated links |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `RESEND_API_KEY` / `EMAIL_FROM` | Transactional email (verification, invites, reports) |
| `CONTACT_EMAIL` | Inbox that receives the public contact form |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe API + webhook verification |
| `STRIPE_STARTER_PRICE_ID` / `STRIPE_STARTER_YEARLY_PRICE_ID` | Starter plan price IDs |
| `STRIPE_PRO_PRICE_ID` / `STRIPE_PRO_YEARLY_PRICE_ID` | Pro plan price IDs |
| `STRIPE_LIFETIME_PRICE_ID` | Lifetime deal price ID |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image uploads |
| `CRON_SECRET` | Shared secret that authorizes scheduled cron endpoints |
| `NEXT_PUBLIC_DEMO` | Set to `true` to run the dashboard in read-only demo mode |

## Project structure

```
src/
  app/                  # App Router routes (public site, auth, dashboard, API, redirects)
  components/            # Shared UI, layout, and marketing components
  features/              # Feature-scoped actions, components, and schemas
    auth/  billing/  campaigns/  clients/  domains/
    guest-links/  links/  onboarding/  settings/
    templates/  uploads/  workspace/
  server/                # DB client, queries, redirect resolution, services
  lib/                    # Cross-cutting utilities (plans, email, cloudinary, etc.)
  config/                 # Site-level constants
prisma/
  schema.prisma           # Data model
```

Each feature folder follows the same shape: `actions/` for server actions, `components/` for client UI, and `schemas/` for Zod validation — keeping domain logic colocated instead of scattered across generic folders.

## Plans

| | Free | Starter | Pro |
| --- | --- | --- | --- |
| Managed links | 50 | 500 | Unlimited |
| Campaigns | 2 | 100 | Unlimited |
| Custom domains | — | 1 | Unlimited |
| Client portals | — | 3 | Unlimited |
| A/B redirect variants | — | 2 | 5 |
| Workspaces | 1 | 1 | 5 |

## Deployment

LinkPilot is designed to deploy on [Vercel](https://vercel.com) with a [Neon](https://neon.tech) Postgres database. Scheduled report emails and cleanup jobs run via Vercel Cron (`vercel.json`), authenticated with `CRON_SECRET`.
