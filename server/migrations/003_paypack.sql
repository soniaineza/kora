-- Paypack integration
-- Run in Supabase SQL Editor after the existing schema.
--
-- Adds a column to transactions that stores the Paypack transaction reference
-- so inbound webhook events (which only carry the Paypack ref) can be matched
-- back to a Kora order.

alter table public.transactions
  add column if not exists provider_reference text;

create index if not exists idx_transactions_provider_reference
  on public.transactions(provider_reference);
