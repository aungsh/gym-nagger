-- ============================================================
-- Gym Nag Bot — schema (drop & recreate if already run)
-- Paste into Supabase SQL Editor and click Run
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
  streak        int not null default 0,
  gym_days      int[] not null default '{}',   -- 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  bot_state     text not null default 'setup'  -- 'setup' | 'idle' | 'waiting_workout'
);

create unique index if not exists users_telegram_id_idx on users(telegram_id);
create unique index if not exists users_handle_idx on users(lower(handle));

-- ---- logs ---------------------------------------------------
create table if not exists logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  status          text not null default 'completed',  -- 'completed' | 'skipped'
  raw_text        text,                               -- null for skipped days
  logged_at       timestamptz not null default now()
);

create index if not exists logs_user_id_idx on logs(user_id);
create index if not exists logs_logged_at_idx on logs(logged_at desc);
