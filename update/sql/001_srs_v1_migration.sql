-- ============================================================================
-- Twebaze Arts — SRS v1.0 Migration
-- Run this whole file in the Supabase SQL Editor (Database > SQL Editor).
-- Written to be safe to run once on your existing project. It does NOT drop
-- your existing `artworks` or `profiles` data — it ALTERs them in place and
-- ADDs the new tables. Read the comments before running in production and
-- take a backup first (Supabase does daily backups automatically, but a
-- manual snapshot before a schema change is good practice).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. SINGLE-ADMIN CLEANUP  (BR-GEN-001)
-- ----------------------------------------------------------------------------
-- The old `profiles` table supported ADMIN + ARTIST accounts. Per the SRS,
-- ARTIST is no longer an account type — artists become a plain reference
-- table (see section 3 below). We keep `profiles` but it should only ever
-- hold your one admin row now.
--
-- We do NOT auto-delete existing ARTIST profiles/auth users here because
-- that's destructive and you may want to keep their artwork data first.
-- Recommended manual step after this migration:
--   1. In Supabase Auth, delete any user accounts that aren't the admin.
--   2. Then: delete from public.profiles where role <> 'ADMIN';
--   3. Then run: alter table public.profiles validate constraint profiles_role_check;
--      (this checks all remaining rows now that only the admin is left,
--      and is a fast metadata-only operation once step 2 is done)

alter table public.profiles
  drop constraint if exists profiles_role_check;

-- NOT VALID: adds the rule for all *future* writes without immediately
-- re-checking every existing row (your old ARTIST rows would fail that
-- check right now). Clean up old rows, then run the VALIDATE statement
-- at the bottom of this section.
alter table public.profiles
  add constraint profiles_role_check check (role = 'ADMIN') not valid;

-- ----------------------------------------------------------------------------
-- 2. ENUM TYPES
-- ----------------------------------------------------------------------------
do $$ begin
  create type artwork_tracking_status as enum ('AVAILABLE','RESERVED','SOLD','ARCHIVED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visibility_status as enum ('PUBLISHED','UNPUBLISHED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type artist_status as enum ('ACTIVE','SUSPENDED','ARCHIVED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_classification as enum (
    'ARTWORK_PURCHASE','CUSTOM_COMMISSION','MURAL_PROJECT',
    'SCULPTURE_INSTALLATION','ART_CLASS_BOOKING','GENERAL_INFO'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_status as enum ('NEW','IN_PROGRESS','QUOTED','CONVERTED','CLOSED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_stage as enum (
    'INITIATION','SITE_ASSESSMENT','PROPOSAL_PHASE','EXECUTION','COMPLETED'
  );
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 3. ARTIST REFERENCE TABLE  (Module 2 — replaces artist *accounts*)
-- ----------------------------------------------------------------------------
create table if not exists public.artists (
  id                 uuid primary key default uuid_generate_v4(),
  full_name          text not null,
  biography          text,
  profile_image_url  text,
  contact_email      text,
  contact_phone      text,
  specializations    text[],
  verified           boolean not null default false,
  status             artist_status not null default 'ACTIVE',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index if not exists artists_full_name_unique on public.artists (lower(full_name));

-- ----------------------------------------------------------------------------
-- 4. ARTWORK CATEGORIES  (FR-ART-002)
-- ----------------------------------------------------------------------------
create table if not exists public.artwork_categories (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique,
  slug  text not null unique
);

-- ----------------------------------------------------------------------------
-- 5. ARTWORKS  — bring existing table up to spec
-- ----------------------------------------------------------------------------
-- Repoint artist_id at the new reference table instead of profiles/auth users.
alter table public.artworks
  drop constraint if exists artworks_artist_id_fkey;

alter table public.artworks
  add column if not exists artist_ref_id       uuid references public.artists(id) on delete set null,
  add column if not exists category_id         uuid references public.artwork_categories(id) on delete set null,
  add column if not exists style               text,
  add column if not exists story               text,
  add column if not exists dimensions_h_cm     numeric,
  add column if not exists dimensions_w_cm     numeric,
  add column if not exists dimensions_d_cm     numeric,
  add column if not exists creation_date       date,
  add column if not exists valuation           numeric check (valuation is null or valuation >= 0),
  add column if not exists cost_basis          numeric check (cost_basis is null or cost_basis >= 0),
  add column if not exists tracking_status     artwork_tracking_status not null default 'AVAILABLE',
  add column if not exists visibility          visibility_status not null default 'UNPUBLISHED',
  add column if not exists featured            boolean not null default false,
  add column if not exists updated_at          timestamptz not null default now();

-- price: enforce >= 0 (VR-ART-002)
alter table public.artworks
  drop constraint if exists artworks_price_check;
alter table public.artworks
  add constraint artworks_price_check check (price is null or price >= 0);

create index if not exists artworks_visibility_idx on public.artworks (visibility);
create index if not exists artworks_featured_idx   on public.artworks (featured) where featured = true;
create index if not exists artworks_category_idx   on public.artworks (category_id);
create index if not exists artworks_artist_ref_idx  on public.artworks (artist_ref_id);

-- ----------------------------------------------------------------------------
-- 6. ARTWORK IMAGES  (FR-ART-004 — multiple images per artwork)
-- ----------------------------------------------------------------------------
create table if not exists public.artwork_images (
  id            uuid primary key default uuid_generate_v4(),
  artwork_id    uuid not null references public.artworks(id) on delete cascade,
  url           text not null,
  webp_url      text,
  is_primary    boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists artwork_images_artwork_idx on public.artwork_images (artwork_id);

-- BR-ART-001: published artwork needs >=1 image + a story. Enforced in the
-- application layer (see artwork.controller.js) since Postgres check
-- constraints can't easily reference a child table's row count.

-- ----------------------------------------------------------------------------
-- 7. CUSTOMERS  (Module 3/4 intake)
-- ----------------------------------------------------------------------------
create table if not exists public.customers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  phone       text,
  created_at  timestamptz not null default now()
);

create index if not exists customers_email_idx on public.customers (lower(email));

-- ----------------------------------------------------------------------------
-- 8. INQUIRIES  (Module 3)
-- ----------------------------------------------------------------------------
create table if not exists public.inquiries (
  id                uuid primary key default uuid_generate_v4(),
  customer_id       uuid not null references public.customers(id) on delete cascade,
  artwork_id        uuid references public.artworks(id) on delete set null,
  classification    inquiry_classification not null,
  message           text not null,
  status            inquiry_status not null default 'NEW',
  internal_notes    text,
  quote_pdf_url     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists inquiries_status_idx  on public.inquiries (status);
create index if not exists inquiries_created_idx on public.inquiries (created_at desc);

-- ----------------------------------------------------------------------------
-- 9. COMMISSIONS & PROJECTS  (Module 4)
-- ----------------------------------------------------------------------------
create table if not exists public.commissions (
  id                  uuid primary key default uuid_generate_v4(),
  inquiry_id          uuid references public.inquiries(id) on delete set null,
  customer_id         uuid not null references public.customers(id) on delete cascade,
  client_ideas        text,
  spatial_constraints text,
  material_choices    text,
  target_deadline     date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.projects (
  id                        uuid primary key default uuid_generate_v4(),
  commission_id             uuid references public.commissions(id) on delete set null,
  customer_id               uuid not null references public.customers(id) on delete cascade,
  title                     text not null,
  site_address              text,
  architectural_dimensions  text,
  surface_characteristics   text,
  assessment_logs           text,
  stage                     project_stage not null default 'INITIATION',
  execution_schedule        text,
  operational_costs         numeric default 0 check (operational_costs >= 0),
  assigned_resources        text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists projects_stage_idx on public.projects (stage);

-- ----------------------------------------------------------------------------
-- 10. ART CLASSES & BOOKINGS  (Module 5)
-- ----------------------------------------------------------------------------
create table if not exists public.art_classes (
  id                 uuid primary key default uuid_generate_v4(),
  course_title       text not null,
  description        text,
  instructor         text,
  session_datetime   timestamptz not null,
  capacity           integer not null check (capacity > 0),
  registration_fee   numeric not null default 0 check (registration_fee >= 0),
  created_at         timestamptz not null default now()
);

-- BR-CLS-001: no scheduling in the past — enforced at insert time in the app
-- (a check constraint using now() is not immutable-safe in Postgres).

create table if not exists public.bookings (
  id               uuid primary key default uuid_generate_v4(),
  class_id         uuid not null references public.art_classes(id) on delete cascade,
  student_name     text not null,
  contact_details  text not null,
  attended         boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists bookings_class_idx on public.bookings (class_id);

-- ----------------------------------------------------------------------------
-- 11. TESTIMONIALS, BLOG, PAYMENTS  (Module 6)
-- ----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id                  uuid primary key default uuid_generate_v4(),
  customer_name       text not null,
  content             text not null,
  related_artwork_id  uuid references public.artworks(id) on delete set null,
  related_project_id  uuid references public.projects(id) on delete set null,
  published           boolean not null default false,
  created_at          timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id                 uuid primary key default uuid_generate_v4(),
  title              text not null,
  slug               text not null unique,
  content_markdown   text not null,
  published          boolean not null default false,
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.payments (
  id                 uuid primary key default uuid_generate_v4(),
  related_type       text not null check (related_type in ('INQUIRY','COMMISSION','PROJECT','BOOKING')),
  related_id         uuid not null,
  invoice_reference  text,
  payment_type       text not null,
  payment_date       date not null default current_date,
  amount             numeric not null check (amount > 0),
  notes              text,
  created_at         timestamptz not null default now()
);

create index if not exists payments_related_idx on public.payments (related_type, related_id);

-- BR-PRO-001: a project can't move to COMPLETED unless its financial log
-- balances. Enforced in application logic (project.controller.js) because
-- "balances" depends on business-defined totals, not a simple DB constraint.

-- ----------------------------------------------------------------------------
-- 12. TRIGGERS
-- ----------------------------------------------------------------------------

-- 12a. updated_at maintenance
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_artworks_updated_at on public.artworks;
create trigger trg_artworks_updated_at before update on public.artworks
  for each row execute function public.set_updated_at();

drop trigger if exists trg_inquiries_updated_at on public.inquiries;
create trigger trg_inquiries_updated_at before update on public.inquiries
  for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_commissions_updated_at on public.commissions;
create trigger trg_commissions_updated_at before update on public.commissions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- 12b. BR-AST-001 — Status Cascades: suspending/archiving an artist
-- unpublishes all of their artworks automatically.
create or replace function public.cascade_artist_status()
returns trigger as $$
begin
  if new.status in ('SUSPENDED','ARCHIVED') and old.status = 'ACTIVE' then
    update public.artworks
      set visibility = 'UNPUBLISHED'
      where artist_ref_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_cascade_artist_status on public.artists;
create trigger trg_cascade_artist_status after update on public.artists
  for each row execute function public.cascade_artist_status();

-- ----------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- All of the new tables are accessed exclusively through the Express API
-- using the Supabase SERVICE ROLE key (which bypasses RLS). We still enable
-- RLS with no permissive policies so the anon/public key can never read or
-- write these tables directly if it leaks into the frontend bundle.

alter table public.artists            enable row level security;
alter table public.artwork_categories enable row level security;
alter table public.artwork_images     enable row level security;
alter table public.customers          enable row level security;
alter table public.inquiries          enable row level security;
alter table public.commissions        enable row level security;
alter table public.projects           enable row level security;
alter table public.art_classes        enable row level security;
alter table public.bookings           enable row level security;
alter table public.testimonials       enable row level security;
alter table public.blog_posts         enable row level security;
alter table public.payments           enable row level security;

-- (No policies added on purpose — service role bypasses RLS entirely;
-- anon/authenticated roles get zero access by default.)

-- ----------------------------------------------------------------------------
-- 14. SEED DATA (optional — a few starter categories)
-- ----------------------------------------------------------------------------
insert into public.artwork_categories (name, slug) values
  ('Painting', 'painting'),
  ('Sculpture', 'sculpture'),
  ('Mixed Media', 'mixed-media'),
  ('Textile', 'textile'),
  ('Photography', 'photography')
on conflict (name) do nothing;