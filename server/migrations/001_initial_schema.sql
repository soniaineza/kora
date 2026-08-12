create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  phone      text not null unique,
  full_name  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.otp_codes (
  id         uuid primary key default gen_random_uuid(),
  phone      text not null,
  otp_hash   text not null,
  expires_at timestamptz not null,
  verified   boolean not null default false,
  attempts   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_otp_codes_phone
  on public.otp_codes (phone, created_at desc);

create index if not exists idx_otp_codes_expires_at
  on public.otp_codes (expires_at);

create table if not exists public.sms_logs (
  id                uuid primary key default gen_random_uuid(),
  phone             text not null,
  message           text not null,
  status            text not null,              
  purpose           text,                         --
  provider_response jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists idx_sms_logs_phone
  on public.sms_logs (phone, created_at desc);

create index if not exists idx_sms_logs_created_at
  on public.sms_logs (created_at desc);
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users (id) on delete cascade,
  phone      text,
  type       text not null,
  message    text not null,
  sent       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user
  on public.notifications (user_id, created_at desc);

create index if not exists idx_notifications_phone
  on public.notifications (phone, created_at desc);
alter table public.users         enable row level security;
alter table public.otp_codes     enable row level security;
alter table public.sms_logs      enable row level security;
alter table public.notifications enable row level security;
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users for select
  using (auth.uid()::text = id::text);
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid()::text = user_id::text);
