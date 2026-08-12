-- Add missing payment_method column to user_packages.
--
-- The production user_packages table was created by an older version of the
-- schema that did not include payment_method. Without it, every order creation
-- (manual + Paypack) fails with:
--   PGRST204: Could not find the 'payment_method' column of 'user_packages'
--
-- Idempotent — safe to run multiple times.

alter table public.user_packages
  add column if not exists payment_method text default 'manual';
