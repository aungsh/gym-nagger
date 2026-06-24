-- ============================================================
-- Gym Nag Bot — initial schema
-- Paste this into Supabase SQL Editor and click "Run"
-- ============================================================

create extension if not exists "pgcrypto";

-- ---- pending_signups ----------------------------------------
create table if not exists pending_signups (
  id            uuid primary key default gen_random_uuid(),
  short_code    text unique not null,
  handle_input  text not null,
  created_at    timestamptz not null default now(),
  consumed_at   timestamptz
);

-- ---- users --------------------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  telegram_id   bigint unique not null,
  handle        text unique not null,
  display_name  text,
  created_at    timestamptz not null default now(),
  nag_hour_utc  int not null default 14,
  streak        int not null default 0
);

create unique index if not exists users_telegram_id_idx on users(telegram_id);
create unique index if not exists users_handle_idx on users(lower(handle));

-- ---- logs ---------------------------------------------------
create table if not exists logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  raw_text        text not null,
  parsed_summary  text,
  logged_at       timestamptz not null default now()
);

create index if not exists logs_user_id_idx on logs(user_id);
create index if not exists logs_logged_at_idx on logs(logged_at desc);
