-- The old trigger on auth.users was manually applied in a prior session and has no
-- exception handler — any failure inside it rolls back the entire delete transaction.
-- Stub creation is handled by the trigger on public.users (migration 01), so this
-- auth.users trigger is redundant and must be removed.
drop trigger if exists on_user_delete_preserve_notes on auth.users;
