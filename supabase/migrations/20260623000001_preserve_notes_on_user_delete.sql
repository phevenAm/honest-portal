-- When a client deletes their account, auto-create a client stub from their
-- profile data and repoint any session notes to that stub — so admin notes
-- survive the account deletion and appear in the "Client profiles" section.
--
-- Fires BEFORE DELETE on public.users so:
--   1. OLD.first_name / last_name are still readable
--   2. session_notes.user_id hasn't been nulled by the cascade yet
--   3. We can update stub_id on the notes before the null happens
--
-- Email comes from auth.users (not public.users, which has no email column).
-- auth.users still exists at trigger fire time because delete_own_account()
-- deletes public.users first, then auth.users.

create or replace function public.preserve_notes_on_user_delete()
returns trigger as $func$
declare
  v_stub_id  uuid;
  v_admin_id uuid;
  v_email    text;
begin
  begin
    if not exists (
      select 1 from public.session_notes where user_id = old.id
    ) then
      return old;
    end if;

    select email into v_email from auth.users where id = old.id;

    select admin_id into v_admin_id
    from public.session_notes
    where user_id = old.id
    limit 1;

    insert into public.client_stubs (created_by, first_name, last_name, email)
    values (
      v_admin_id,
      coalesce(old.first_name, 'Former'),
      coalesce(old.last_name,  'Client'),
      v_email
    )
    returning id into v_stub_id;

    update public.session_notes
    set stub_id = v_stub_id
    where user_id = old.id;

  exception when others then
    null;
  end;
  return old;
end;
$func$ language plpgsql security definer;

drop trigger if exists on_user_delete_preserve_notes on public.users;
create trigger on_user_delete_preserve_notes
  before delete on public.users
  for each row
  execute function public.preserve_notes_on_user_delete();
