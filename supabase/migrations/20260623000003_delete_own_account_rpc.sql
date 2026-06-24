create or replace function public.delete_own_account()
returns void as $func$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete from public.users first so the preserve_notes_on_user_delete trigger fires
  delete from public.users where id = v_uid;

  -- Then remove the auth record
  delete from auth.users where id = v_uid;
end;
$func$ language plpgsql security definer;
