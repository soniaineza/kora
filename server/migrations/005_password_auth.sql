alter table public.users
  add column if not exists password_hash text;
alter table public.users
  add column if not exists email text;
create unique index if not exists idx_users_email
  on public.users(email)
  where email is not null;









