-- Supabase schema for KORA payment/activation + OTP
-- Run in Supabase SQL editor (the project: diffxypkosxukoxzfsew)

-- NOTE:
-- 1) Enable required extensions
-- 2) Tables created for:
--    - phone_verifications (OTP storage)
--    - user_packages (package activation state)
--
-- After creating, ensure your RLS policies align with how you access data.

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

-- keep updated_at fresh
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
-- package_key examples (align with frontend/backend):
-- STARTER, BASIC, STANDARD, MASTER, PREMIUM(=3000), PRO, UNLIMITED
create table if not exists public.user_packages (
  id text primary key,
  phone text not null,
  package_key text not null,
  network text,
  amount_rwf integer,
  status text not null default 'pending',
  payment_reference text,
  activated_at timestamptz,
  expires_at timestamptz,
  remaining_attempts integer,
  unlimited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_packages_updated_at on public.user_packages;
create trigger trg_user_packages_updated_at
before update on public.user_packages
for each row execute function public.set_updated_at();

-- Helpful index
create index if not exists idx_user_packages_phone_status on public.user_packages(phone, status);

-- Exam sessions (attempt tracking + expiry)
-- Each session is created when the user starts an exam.
-- Requires sessionId to access the quiz to prevent bypass.
create table if not exists public.exam_sessions (
  id text primary key,
  phone text not null,
  plan text not null,
  status text not null default 'active',
  expires_at timestamptz,
  -- optional: bind to which activation gave attempts
  user_package_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_exam_sessions_updated_at on public.exam_sessions;
create trigger trg_exam_sessions_updated_at
before update on public.exam_sessions
for each row execute function public.set_updated_at();

create index if not exists idx_exam_sessions_phone_active on public.exam_sessions(phone, status);


