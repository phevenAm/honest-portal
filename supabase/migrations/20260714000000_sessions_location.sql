alter table public.sessions
  add column if not exists location text check (location in ('remote', 'in_person')),
  add column if not exists address text;

alter table public.sessions alter column location drop not null;
