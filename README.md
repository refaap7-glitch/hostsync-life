# HostSync Lite

MVP PWA for small vacation-rental hosts (1-10 properties): manage reservations
synced from Airbnb/Booking, send automated WhatsApp check-in/check-out
messages, coordinate cleaning/maintenance tasks with external providers, and
get simple dynamic pricing suggestions.

## Structure

```
server/   Express + TypeScript + Prisma (PostgreSQL) API
web/      Next.js 14 App Router PWA (Tailwind, React Query, NextAuth)
```

All external integrations (WhatsApp, payments, Airbnb/Booking, provider
notifications) sit behind an **Adapter** interface in `server/src/adapters`,
and default to mock implementations that require zero credentials. Flip an
env var once you have real API keys — nothing else in the code changes.

## Prerequisites

- Node.js 20+
- A PostgreSQL database (a free [neon.tech](https://neon.tech) project works well)

## 1. Backend setup (`server/`)

```bash
cd server
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, INTERNAL_API_KEY
npm install
npx prisma migrate dev --name init
npm run prisma:seed       # creates demo@hostsync.app / demo1234 with sample data
npm run dev                # http://localhost:4000
```

## 2. Frontend setup (`web/`)

```bash
cd web
cp .env.example .env      # INTERNAL_API_KEY must match server/.env exactly
npm install
npm run dev                # http://localhost:3000
```

Log in with `demo@hostsync.app` / `demo1234` (from the seed script), or
register a new account.

## Adapter swap-in (going from mock to real)

| Integration | Env flag | Real implementation |
|---|---|---|
| WhatsApp (Twilio) | `USE_REAL_WHATSAPP=true` + `TWILIO_*` vars | `server/src/adapters/messaging/WhatsAppAdapter.ts` |
| Payments (MercadoPago) | `USE_REAL_PAYMENTS=true` + `MERCADOPAGO_ACCESS_TOKEN` | `server/src/adapters/payment/MercadoPagoAdapter.ts` |
| Airbnb / Booking sync | mock only (no public per-host API to call) | `server/src/adapters/channel/{Airbnb,Booking}Adapter.ts` |
| Google sign-in | set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `web/.env`, plus `NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED=true` | `web/lib/auth.ts` |

All selection logic lives in `server/src/adapters/index.ts`.

## Architecture notes

- **Auth**: NextAuth (JWT strategy) on the frontend. Credentials login calls
  the Express `/api/auth/login`; the Express-issued JWT is kept server-side
  inside the NextAuth token and never sent to the browser.
- **Frontend <-> backend**: the browser only ever calls same-origin
  `web/app/api/**/route.ts` handlers. Those proxy to Express, attaching the
  session's bearer token plus a shared `INTERNAL_API_KEY` header so the
  Express API can't be hit directly by arbitrary clients.
- **Provider task completion**: providers don't have accounts. Each task gets
  a random `accessToken`; assigning a task sends (simulated) a WhatsApp link
  to `/provider/tasks/:id?token=...`, a public page where the provider marks
  the task complete and uploads a photo (stored on local disk via `multer`,
  served from `/uploads`).
- **Pricing rule**: `server/src/services/pricing.ts` — occupancy > 80% this
  month suggests +10%, occupancy < 30% suggests -10%.

## Deploying

This was built and verified locally; it hasn't been deployed. To ship it as
designed in the spec:

1. **Database**: create a [neon.tech](https://neon.tech) Postgres project, set `DATABASE_URL` there.
2. **Backend**: deploy `server/` to Railway or Render (Dockerfile included).
   Set all vars from `server/.env.example`; run `npx prisma migrate deploy` once.
3. **Frontend**: deploy `web/` to Vercel. Set all vars from `web/.env.example`,
   pointing `API_URL` at the deployed backend and `NEXTAUTH_URL` at the
   Vercel domain.

## What's mocked vs. real in this MVP

- WhatsApp, MercadoPago: mocked by default (see table above) — adapters log
  and simulate success/failure so the flows are fully exercisable without
  credentials.
- Airbnb/Booking reservation sync: always mocked (no public partner API
  available to an individual host), generates plausible reservations.
- Google Calendar: not wired up in this MVP (not required by the acceptance
  criteria); `ChannelAdapter.syncCalendar` exists as a stub for a future adapter.
