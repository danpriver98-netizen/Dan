-- ═══════════════════════════════════════════════════════════════
-- Real-Estate 360° CRM — Initial Schema
-- Supabase / PostgreSQL
-- Covers: CRM core, smart tagging, properties + lifecycle automation,
-- omnichannel comms, matching, finance BI, tasks, appointments.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── ENUMS ──────────────────────────────────────────────────────
create type contact_type    as enum ('seller', 'buyer', 'renter');
create type pipeline_stage  as enum ('active', 'nurturing', 'past_client');
create type seriousness     as enum ('hot', 'warm', 'cold');
create type property_status as enum ('active', 'under_offer', 'sold', 'rented', 'archived');
create type listing_origin  as enum ('internal', 'proptech_feed');
create type task_status      as enum ('pending', 'done', 'rolled_over');
create type rsvp_status      as enum ('pending', 'confirmed', 'cancelled');
create type cheque_status    as enum ('pending', 'cleared', 'bounced');

-- ─── TAGS (Dynamic Tagging System) ──────────────────────────────
create table tags (
  id    uuid primary key default gen_random_uuid(),
  label text not null unique,        -- e.g. '#BigBalcony'
  color text not null default 'slate',
  kind  text not null default 'custom', -- physical | financial | behavioral | location | custom
  created_at timestamptz default now()
);

-- ─── CONTACTS (Sellers / Buyers / Renters unified) ──────────────
create table contacts (
  id          uuid primary key default gen_random_uuid(),
  type        contact_type not null,
  name        text not null,
  phone       text not null,
  email       text,
  city        text,
  stage       pipeline_stage not null default 'active',
  seriousness seriousness not null default 'warm',
  source      text,
  dnc_flagged boolean not null default false,  -- Do-Not-Call registry hit
  notes       text,
  -- buyer / renter preferences
  budget_min      numeric,
  budget_max      numeric,
  preferred_cities text[],
  rooms           int,
  -- renter lifecycle
  lease_start_date date,
  lease_end_date   date,
  -- seller linkage
  property_id     uuid,
  last_contacted_at timestamptz,
  created_at      timestamptz default now()
);

-- many-to-many: contact tags
create table contact_tags (
  contact_id uuid references contacts(id) on delete cascade,
  tag_id     uuid references tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

-- buyer desired property tags (matching engine input)
create table contact_desired_tags (
  contact_id uuid references contacts(id) on delete cascade,
  tag_id     uuid references tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

-- ─── PROPERTIES ─────────────────────────────────────────────────
create table properties (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,   -- 'Name Bot' lookup code
  title         text not null,
  address       text,
  city          text,
  status        property_status not null default 'active',
  origin        listing_origin not null default 'internal',
  asking_price  numeric not null,
  sold_price    numeric,
  rooms         int,
  size_sqm      int,
  exclusive     boolean default false,
  seller_id     uuid references contacts(id) on delete set null,
  image         text,
  commission_rate numeric default 2,
  -- brochure asset availability (Name Bot package)
  brochure_tabu        boolean default false,
  brochure_municipal   boolean default false,
  brochure_floorplan   boolean default false,
  brochure_tour        boolean default false,
  brochure_comparables boolean default false,
  created_at    timestamptz default now()
);

alter table contacts
  add constraint fk_contact_property
  foreign key (property_id) references properties(id) on delete set null;

create table property_tags (
  property_id uuid references properties(id) on delete cascade,
  tag_id      uuid references tags(id) on delete cascade,
  primary key (property_id, tag_id)
);

-- ─── STATUS LIFECYCLE AUTOMATION ────────────────────────────────
-- When a property is marked SOLD, move its seller to 'past_client'
-- (Past Clients Archive) to trigger separate marketing flows.
create or replace function fn_property_sold_archive_seller()
returns trigger as $$
begin
  if new.status = 'sold' and (old.status is distinct from 'sold') then
    update contacts
       set stage = 'past_client'
     where id = new.seller_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_property_sold
  after update of status on properties
  for each row
  execute function fn_property_sold_archive_seller();

-- ─── OMNICHANNEL: TEMPLATES + CALL LOGS ─────────────────────────
create table message_templates (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  category text not null default 'marketing',
  language text not null default 'en',
  body     text not null,
  status   text not null default 'pending', -- approved | pending | rejected
  created_at timestamptz default now()
);

create table call_logs (
  id           uuid primary key default gen_random_uuid(),
  contact_id   uuid references contacts(id) on delete cascade,
  direction    text not null,        -- inbound | outbound
  duration_sec int not null default 0,
  outcome      text not null default 'connected',
  recording_url text,                -- cloud PBX recording (server-side)
  dnc_checked  boolean default true,
  created_at   timestamptz default now()
);

-- ─── FINANCE BI ─────────────────────────────────────────────────
create table marketing_expenses (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  category    text not null,  -- facebook_ads | photography | signage | staging | other
  label       text,
  amount      numeric not null,
  spent_on    date default now(),
  created_at  timestamptz default now()
);

create table cheques (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete set null,
  client_name text not null,
  amount      numeric not null,
  due_date    date not null,
  status      cheque_status not null default 'pending',
  direction   text not null default 'incoming', -- incoming | outgoing
  created_at  timestamptz default now()
);

-- ─── ROLLING TASK BOARD ─────────────────────────────────────────
create table agenda_tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  contact_id  uuid references contacts(id) on delete set null,
  due_date    date not null,
  status      task_status not null default 'pending',
  rolled_from date,
  priority    text not null default 'medium',
  synced_to_calendar boolean default false,
  created_at  timestamptz default now()
);

-- Rollover logic: any pending task with due_date < today rolls to today.
-- Run daily via cron (pg_cron or external scheduler hitting /api/cron).
create or replace function fn_roll_over_tasks()
returns void as $$
begin
  update agenda_tasks
     set rolled_from = coalesce(rolled_from, due_date),
         due_date = current_date,
         status = 'rolled_over'
   where status = 'pending'
     and due_date < current_date;
end;
$$ language plpgsql;

-- ─── APPOINTMENTS (RSVP) ────────────────────────────────────────
create table appointments (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid references properties(id) on delete cascade,
  contact_id   uuid references contacts(id) on delete cascade,
  scheduled_at timestamptz not null,
  status       rsvp_status not null default 'pending',
  waze_url     text,
  confirmation_token text not null default gen_random_uuid()::text,
  created_at   timestamptz default now()
);

-- ─── RENTER 11-MONTH RENEWAL TRIGGER ────────────────────────────
-- Returns renters whose lease started ~11 months ago (renewal window).
-- A daily cron hits /api/cron/renter-renewal which calls this.
create or replace view v_renter_renewals as
  select c.*,
         (c.lease_start_date + interval '11 months')::date as renewal_alert_date
    from contacts c
   where c.type = 'renter'
     and c.lease_start_date is not null
     and current_date >= (c.lease_start_date + interval '11 months')::date
     and current_date <  (c.lease_start_date + interval '12 months')::date;

-- ─── INDEXES ────────────────────────────────────────────────────
create index idx_contacts_type   on contacts(type);
create index idx_contacts_stage  on contacts(stage);
create index idx_properties_status on properties(status);
create index idx_properties_code on properties(code);
create index idx_call_logs_contact on call_logs(contact_id);
create index idx_tasks_due on agenda_tasks(due_date, status);

-- ─── ROW LEVEL SECURITY (enable; policies per-agent/org) ─────────
alter table contacts          enable row level security;
alter table properties        enable row level security;
alter table call_logs         enable row level security;
alter table marketing_expenses enable row level security;
alter table cheques           enable row level security;
alter table agenda_tasks      enable row level security;
alter table appointments      enable row level security;
alter table message_templates enable row level security;

-- Authenticated users can access (tighten to org_id / agent_id in prod).
create policy "authenticated_all_contacts" on contacts
  for all to authenticated using (true) with check (true);
create policy "authenticated_all_properties" on properties
  for all to authenticated using (true) with check (true);
create policy "authenticated_all_calls" on call_logs
  for all to authenticated using (true) with check (true);
create policy "authenticated_all_expenses" on marketing_expenses
  for all to authenticated using (true) with check (true);
create policy "authenticated_all_cheques" on cheques
  for all to authenticated using (true) with check (true);
create policy "authenticated_all_tasks" on agenda_tasks
  for all to authenticated using (true) with check (true);
create policy "authenticated_all_appts" on appointments
  for all to authenticated using (true) with check (true);
create policy "authenticated_all_templates" on message_templates
  for all to authenticated using (true) with check (true);
