-- Supabase schema for KORA payment/activation + OTP
-- Run in Supabase SQL editor (project: diffxypkosxukoxzfsew)
-- This version uses `payment_reference` consistently (no Flutterwave-specific columns)

create extension if not exists pgcrypto;

-- OTP verification codes
create table if not exists public.phone_verifications (
  phone text primary key,
  code text not null,
  expires_at timestamptz not null,
  purpose text not null default 'registration',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_phone_verifications_updated_at on public.phone_verifications;
create trigger trg_phone_verifications_updated_at
before update on public.phone_verifications
for each row execute function public.set_updated_at();

-- Package activations for users
create table if not exists public.user_packages (
  id text primary key,
  phone text not null,
  package_key text not null,
  network text,
  amount_rwf integer,
  status text not null default 'pending',
  payment_reference text,           -- unified payment reference
  activated_at timestamptz,
  expires_at timestamptz,
  total_attempts integer,
  remaining_attempts integer,
  unlimited boolean not null default false,
  payment_method text DEFAULT 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_packages_updated_at on public.user_packages;
create trigger trg_user_packages_updated_at
before update on public.user_packages
for each row execute function public.set_updated_at();

create index if not exists idx_user_packages_phone_status on public.user_packages(phone, status);
create index if not exists idx_user_packages_payment_reference on public.user_packages(payment_reference);

-- Exam sessions (attempt tracking + expiry)
create table if not exists public.exam_sessions (
  id text primary key,
  phone text not null,
  plan text not null,
  status text not null default 'active',
  expires_at timestamptz,
  duration_seconds integer,
  score integer,
  total_questions integer,
  completed_at timestamptz,
  user_package_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.exam_sessions add column if not exists duration_seconds integer;
alter table public.exam_sessions add column if not exists score integer;
alter table public.exam_sessions add column if not exists total_questions integer;
alter table public.exam_sessions add column if not exists completed_at timestamptz;

drop trigger if exists trg_exam_sessions_updated_at on public.exam_sessions;
create trigger trg_exam_sessions_updated_at
before update on public.exam_sessions
for each row execute function public.set_updated_at();

create index if not exists idx_exam_sessions_phone_active on public.exam_sessions(phone, status);

-- Attempt audit trail
create table if not exists public.attempt_history (
  id bigserial primary key,
  user_id text not null,
  user_package_id text not null,
  exam_session_id text not null,
  plan text not null,
  exam_id text,
  attempt_consumed boolean not null default false,
  attempt_consumed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_attempt_history_updated_at on public.attempt_history;
create trigger trg_attempt_history_updated_at
before update on public.attempt_history
for each row execute function public.set_updated_at();

create index if not exists idx_attempt_history_user_package on public.attempt_history(user_package_id);
create index if not exists idx_attempt_history_user on public.attempt_history(user_id);