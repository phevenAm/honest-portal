create table if not exists public.reschedule_requests (
  id           uuid        primary key default gen_random_uuid(),
  session_id   uuid        not null references public.sessions(id) on delete cascade,
  client_id    uuid        not null references auth.users(id) on delete cascade,
  requested_at timestamptz not null,
  message      text,
  status       text        not null default 'pending'
                           check (status in ('pending', 'accepted', 'rejected')),
  created_at   timestamptz not null default now()
);

alter table public.reschedule_requests enable row level security;

create policy "clients can insert own reschedule requests"
  on public.reschedule_requests for insert
  with check (client_id = auth.uid());

create policy "clients can view own reschedule requests"
  on public.reschedule_requests for select
  using (client_id = auth.uid());

create policy "admins can manage reschedule requests"
  on public.reschedule_requests for all
  using (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()
        and public.users.role = 'admin'
    )
  );
