-- Client stubs: admin-owned representation of a client (no auth account required).
-- linked_user_id is nullable and set to null (not cascade) when the real user deletes
-- their account — admin notes and profile data survive the account deletion.
create table if not exists public.client_stubs (
  id             uuid        primary key default gen_random_uuid(),
  created_by     uuid        not null references auth.users(id) on delete cascade,
  linked_user_id uuid        references auth.users(id) on delete set null,
  first_name     text        not null,
  last_name      text        not null,
  email          text,
  created_at     timestamptz not null default now()
);

alter table public.client_stubs enable row level security;

drop policy if exists "admins can manage client stubs" on public.client_stubs;
create policy "admins can manage client stubs"
  on public.client_stubs
  for all
  using (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()
        and public.users.role = 'admin'
    )
  );

-- Session notes: admin notes about a client.
-- Can reference either a real user (user_id) or a stub (stub_id).
-- user_id uses set null so orphaned notes survive if a client deletes their account.
-- stub_id cascades because the stub is the admin's own record.
create table if not exists public.session_notes (
  id       uuid        primary key default gen_random_uuid(),
  admin_id uuid        not null references auth.users(id) on delete cascade,
  user_id  uuid        references auth.users(id) on delete set null,
  stub_id  uuid        references public.client_stubs(id) on delete cascade,
  content  text        not null,
  created_at timestamptz not null default now()
);

alter table public.session_notes enable row level security;

drop policy if exists "admins can manage session notes" on public.session_notes;
create policy "admins can manage session notes"
  on public.session_notes
  for all
  using (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()
        and public.users.role = 'admin'
    )
  );
