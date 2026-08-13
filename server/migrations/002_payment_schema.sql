-- Payment System Schema
-- Run in Supabase SQL Editor after existing schema
--
-- Payments are recorded as manual orders. Users place an order (status
-- 'pending') and an admin activates it after being paid offline. There is no
-- external payment provider.

-- Transactions table - every payment attempt / manual order
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  package_key text not null,
  tx_ref text not null unique,
  payment_provider text not null default 'manual',
  payment_method text,
  amount_rwf integer not null,
  currency text not null default 'RWF',
  phone_number text not null,
  email text,
  status text not null default 'pending', 
  verified boolean not null default false,
  webhook_received boolean not null default false,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_tx_ref on public.transactions(tx_ref);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

-- Subscriptions table - active/expired packages
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  package_key text not null,
  activated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active',
  payment_reference text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_expires_at on public.subscriptions(expires_at);

-- RLS policies
alter table public.transactions enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions for select
  using (auth.uid()::text = user_id::text);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions for select
  using (auth.uid()::text = user_id::text);

-- Function to update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();