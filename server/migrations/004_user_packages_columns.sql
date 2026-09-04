alter table public.user_packages
  add column if not exists payment_method text default 'manual';
