alter table public.transactions
  add column if not exists provider_reference text;

create index if not exists idx_transactions_provider_reference
  on public.transactions(provider_reference);
