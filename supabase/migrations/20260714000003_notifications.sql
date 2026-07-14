create table if not exists public.notifications (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  type       text        not null,
  message    text        not null,
  read       boolean     not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "users can read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "users can mark own notifications as read"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "admins can insert notifications"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()
        and public.users.role = 'admin'
    )
  );

-- enable realtime so the client gets instant push without polling
alter publication supabase_realtime add table public.notifications;
