# TgDir — Telegram Channel & Group Directory

Full-stack MVP for a multilingual Telegram channel/group directory site with
admin moderation, premium listings, and a user dashboard. Built with
Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, and next-intl.

![TgDir preview](docs/preview.png)

## Features

- **Public site** — homepage with hero, animated counters, language tabs, and
  a ranked channel table (gold-badge premium rows, rank change arrows).
- **Channel detail** — cream-highlight card, chips, stats, Recharts growth
  line, similar channels table.
- **10 locales** — `tr, en, ru, zh, id, vi, es, ar, de, fr` via next-intl,
  with RTL support for Arabic.
- **Dark/light theme** via `next-themes` (persisted, smooth transition).
- **Auth** — NextAuth Credentials with bcrypt (cost 12), email verification
  token, password reset, Google OAuth placeholder.
- **User dashboard** — submit channels (4-step wizard with "Fetch from
  Telegram"), manage listings, premium checkout, account settings.
- **Admin panel** (RBAC) — dashboard, moderation queue, CRUD for channels /
  categories / tags / users / premium plans / coupons / pages / site
  settings / SEO, trend weights.
- **Premium flow** — 4 plans (Bronze/Silver/Gold/Platinum), coupons
  (PERCENT/FIXED), manual bank-transfer flow end-to-end, Stripe / PayPal /
  Coinbase webhook skeletons.
- **Cron jobs** — stats refresh (Telegram Bot API), premium expiry,
  premium-expiring email reminders. All protected with `CRON_SECRET`.
- **Email** — Resend in production, dev console log fallback. 8 templates
  (welcome, verify, reset, channel approved/rejected, premium activated,
  premium expiring, receipt).
- **Security** — in-memory rate limiter, CSP + HSTS + frame headers,
  parameterised Prisma queries, zod validation on every API boundary.

## Quick start

```bash
cp .env.example .env
npm install
npm run db:push        # create dev.db from schema (SQLite)
npm run db:seed        # 17 channels, 16 categories, 4 plans, admin + demo user
npm run dev            # http://localhost:3000
```

Seeded accounts:

| Email                | Password     | Role        |
| -------------------- | ------------ | ----------- |
| admin@tgdir.local    | admin12345   | SUPER_ADMIN |
| user@tgdir.local     | demo12345    | USER        |

The seed data mirrors the design screenshots: Pavel Durov (@durov), Telegram
News, NASA Updates, Crypto Signals Daily, TechCrunch, Meme Hub, Forex Pro
Trading, Game Leaks, Coding Daily, Health Tips, plus the Technology similar
channels for the detail page.

## Environment variables

Copy `.env.example` to `.env` and adjust:

| Variable                    | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`              | SQLite dev path or Postgres URL in prod              |
| `NEXTAUTH_SECRET`           | NextAuth session signing                              |
| `NEXTAUTH_URL`              | Public app URL (used in verification/reset emails)   |
| `CRON_SECRET`               | Bearer token for `/api/cron/*`                       |
| `TELEGRAM_BOT_TOKEN`        | Real Bot API (optional — mock used when absent)      |
| `RESEND_API_KEY`            | Real email delivery (optional — logs when absent)    |
| `EMAIL_FROM`                | "TgDir <no-reply@yourdomain>"                        |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe (optional)                    |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`   | PayPal (optional)                    |
| `COINBASE_COMMERCE_KEY`, `COINBASE_WEBHOOK_SECRET` | Coinbase Commerce (optional)   |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`   | Google OAuth (optional)              |
| `ADMIN_SEED_PASSWORD`        | Override seed admin password                         |

## Scripts

| Script          | Description                                     |
| --------------- | ----------------------------------------------- |
| `dev`           | Next dev server                                 |
| `build`         | `prisma generate` + `next build`                |
| `start`         | Production server                               |
| `lint`          | ESLint                                          |
| `typecheck`     | `tsc --noEmit`                                  |
| `db:generate`   | Generate Prisma client                          |
| `db:push`       | Push schema without creating a migration        |
| `db:migrate`    | Create + apply a new migration                  |
| `db:seed`       | Run `prisma/seed.ts`                            |
| `db:studio`     | Open Prisma Studio                              |

## Cron setup

Each route accepts `POST` or `GET` with `Authorization: Bearer $CRON_SECRET`
(or header `x-cron-secret`).

| Route                             | Recommended schedule |
| --------------------------------- | -------------------- |
| `/api/cron/update-stats`          | Every hour           |
| `/api/cron/expire-premium`        | Every hour           |
| `/api/cron/premium-reminders`     | Daily                |

### Vercel Cron (`vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/update-stats", "schedule": "0 * * * *" },
    { "path": "/api/cron/expire-premium", "schedule": "15 * * * *" },
    { "path": "/api/cron/premium-reminders", "schedule": "0 8 * * *" }
  ]
}
```

Set the `CRON_SECRET` env var and wire it in the Vercel dashboard.

### GitHub Actions

```yaml
on:
  schedule:
    - cron: "0 * * * *"
jobs:
  update-stats:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST "$APP_URL/api/cron/update-stats" \
            -H "Authorization: Bearer $CRON_SECRET"
        env:
          APP_URL: ${{ secrets.APP_URL }}
          CRON_SECRET: ${{ secrets.CRON_SECRET }}
```

## Deployment notes

- **Postgres**: flip `prisma/schema.prisma` `datasource.provider` to
  `"postgresql"`, point `DATABASE_URL` at the cluster, then
  `npm run db:migrate`. The schema uses only portable types.
- **Rate limiter**: `src/lib/ratelimit.ts` uses in-memory state — replace
  with `@upstash/ratelimit` or a Redis-backed solution when running on
  multiple instances.
- **Payments**: the manual bank-transfer flow is complete end-to-end
  (checkout → admin confirms → premium activates → email receipt). Stripe,
  PayPal and Coinbase webhook endpoints verify + mark orders `PAID`, but the
  full checkout redirect/session creation is a follow-up task.
- **Google OAuth / Telegram login**: provider routes are wired; set the
  corresponding env vars to enable them.
- **CAPTCHA**: rate limiting on auth endpoints covers the brute-force
  surface. Add hCaptcha/Turnstile on register + forgot-password forms by
  checking `process.env.CAPTCHA_SITE_KEY` in the client components.

## Project layout

```
src/
  app/
    [locale]/             public site, auth pages, dashboard, admin
    api/                  auth, user, admin, telegram, webhooks, cron
  components/
    ui/                   shadcn-style primitives
    layout/               header, footer, promo bar, language switcher
    channels/             channel table, rank indicator, avatars, badges
    charts/               Recharts growth / pie
    dashboard/, admin/    feature modules
  lib/                    prisma, auth, rbac, telegram, email, ratelimit,
                          cron, utils, format, constants
  i18n/                   next-intl routing + navigation
messages/                 10 JSON dictionaries
prisma/
  schema.prisma
  seed.ts
```

## Status

The current scope is a production-kalitesinde MVP. Open follow-ups:

- Stripe/PayPal/Coinbase full checkout (sessions + success redirects)
- Real Google OAuth / Telegram Login Widget credentials
- Lighthouse 90+ pass (structure is ready; needs measurement iteration)
- Rich-text editor for pages (currently markdown textarea)
- Virus/URL reputation checks for submitted invite links
