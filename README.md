# Real-Estate 360° CRM & Automation Ecosystem

A high-end, mobile-first CRM & automation platform for real estate agents — built with
**Next.js (App Router) · React · TailwindCSS · shadcn/ui · Supabase**.

The app runs **fully on mock data** out of the box (no credentials required), so every
module is testable immediately. Add Supabase / WhatsApp / PBX / PropTech credentials in
`.env.local` to wire up live services.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — app works without it
npm run dev                  # http://localhost:3000
```

---

## Modules

### 1. CRM Core & Smart Tagging
- Unified **Sellers / Buyers / Renters** entities (`/contacts`).
- **Dynamic tagging system** (`#BigBalcony`, `#Penthouse`, `#Commercial`, `#BudgetUnder2.5M`, `#Urgent`…) — attach/detach and filter.
- **Status lifecycle automation:** marking a property **Sold** (`/properties`) auto-moves its seller to the *Past Clients Archive* (`past_client` stage) — handled by the SQL trigger `fn_property_sold_archive_seller()`.
- **Do-Not-Call regulator check** on every incoming/captured number (`/lib/dnc.ts`, `POST /api/dnc-check`).

### 2. Omnichannel Communication (`/communication`)
- **WhatsApp Cloud API** template management + **tag-filtered bulk messaging** with live preview.
- **Cloud PBX / VoIP call logs** linked to client files, with a **mock recording player** (served server-side to bypass iOS/Android limits).
- **Name Bot** (`/properties`, `GET /api/brochure?code=…`): type a property code → auto-packages a digital brochure (Tabu deed, municipal tax, floor plan, virtual tour, comparables).

### 3. Internal Matching Engine (`/matching`)
- Algorithmic cross-referencing of buyer preference tags (budget, city, `#tags`, rooms) against internal **and** PropTech-feed listings (`/lib/matching.ts`).
- **One-Click Broadcast:** blast a WhatsApp template to all matched candidates at once — DNC-flagged contacts auto-excluded.

### 4. Financial BI (`/finance`) — internal tracking only
- **Marketing ROI per listing:** expenses (FB ads, photography, signage…) vs commission → net profit chart.
- **Cheque & cash-flow ledger:** pending/cleared commissions, due dates, incoming/outgoing.
- **Tax estimator:** real-time VAT (Ma'am 18%) + income-tax projections (`/lib/tax.ts`).

### 5. Mobile UX & Field Operations
- **Quick Action FAB:** floating button to add a client from a recent call, tag them, and set a callback — in ~5 seconds (with inline DNC check).
- **RSVP appointments** (`/appointments`): confirmation links + **Waze** button; Confirm/Cancel syncs to the agent's calendar.
- **Rolling Task Board** (`/tasks`): unchecked tasks auto-roll to the next day (`GET /api/cron/roll-tasks`, SQL `fn_roll_over_tasks()`), with Google Calendar sync indicators.
- **Renter 11-month trigger:** cron logic fires a renewal alert 11 months after lease start (`GET /api/cron/renter-renewal`, SQL view `v_renter_renewals`).

---

## Architecture

```
src/
├── app/                # App Router pages + API routes
│   ├── api/            # dnc-check, brochure, cron/*, recording/*
│   ├── contacts, properties, matching, communication,
│   │   finance, tasks, appointments
│   └── layout.tsx, page.tsx (dashboard)
├── components/
│   ├── ui/             # shadcn-style primitives
│   └── layout/         # sidebar, mobile nav, quick-action FAB, theme
└── lib/
    ├── types.ts, mock-data.ts
    ├── matching.ts, dnc.ts, tax.ts
    └── supabase/       # client + server (graceful no-op without env)
supabase/migrations/
└── 0001_initial_schema.sql   # full schema + triggers + RLS + cron fns
```

### Supabase
Apply the schema with the Supabase CLI or dashboard:

```bash
supabase db push   # or paste supabase/migrations/0001_initial_schema.sql
```

It includes: enums, unified `contacts`, `tags` (+ join tables), `properties`,
the **sold→archive** trigger, omnichannel tables, finance tables, the
**rolling-task** function, appointments, the **renter renewal view**,
indexes, and Row-Level Security policies.

### Design
Slate + Teal professional palette, dark/light toggle, data-dense but clean,
optimised for **extreme mobile scannability** (bottom nav + sticky FAB) since
agents work from the field.

> **Note:** Financial module is **internal monitoring only** — not official
> invoicing software, by design.
