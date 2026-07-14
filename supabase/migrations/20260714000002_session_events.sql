create table if not exists public.session_events (
  id          uuid        primary key default gen_random_uuid(),
  session_id  uuid        not null references public.sessions(id) on delete cascade,
  event_type  text        not null
              check (event_type in ('scheduled', 'rescheduled', 'cancelled', 'paid', 'unpaid', 'attended', 'no_show')),
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

alter table public.session_events enable row level security;

create policy "admins can read session events"
  on public.session_events for select
  using (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()
        and public.users.role = 'admin'
    )
  );

create or replace function public.log_session_insert_event()
returns trigger language plpgsql security definer as $$
begin
  insert into public.session_events(session_id, event_type)
  values (new.id, 'scheduled');
  return new;
end;
$$;

create trigger session_event_on_insert
  after insert on public.sessions
  for each row execute function public.log_session_insert_event();

create or replace function public.log_session_update_event()
returns trigger language plpgsql security definer as $$
begin
  if new.scheduled_at is distinct from old.scheduled_at then
    insert into public.session_events(session_id, event_type, metadata)
    values (new.id, 'rescheduled', jsonb_build_object('from', old.scheduled_at, 'to', new.scheduled_at));
  end if;

  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    insert into public.session_events(session_id, event_type)
    values (new.id, 'cancelled');
  end if;

  if new.paid is distinct from old.paid then
    insert into public.session_events(session_id, event_type)
    values (new.id, case when new.paid then 'paid' else 'unpaid' end);
  end if;

  if new.attended is distinct from old.attended and new.attended is not null then
    insert into public.session_events(session_id, event_type)
    values (new.id, case when new.attended then 'attended' else 'no_show' end);
  end if;

  return new;
end;
$$;

create trigger session_event_on_update
  after update on public.sessions
  for each row execute function public.log_session_update_event();
