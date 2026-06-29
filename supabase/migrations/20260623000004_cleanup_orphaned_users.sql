-- One-time cleanup: remove public.users rows whose auth.users record is already gone.
-- For any orphan that has session_notes, create a stub before deleting.
-- Email is NULL because auth.users is already gone for these orphaned rows.
do $$
declare
  rec        record;
  v_stub_id  uuid;
  v_admin_id uuid;
begin
  for rec in
    select u.*
    from public.users u
    left join auth.users au on u.id = au.id
    where au.id is null
  loop
    if exists (select 1 from public.session_notes where user_id = rec.id) then
      select admin_id into v_admin_id
      from public.session_notes
      where user_id = rec.id
      limit 1;

      insert into public.client_stubs (created_by, first_name, last_name, email)
      values (
        v_admin_id,
        coalesce(rec.first_name, 'Former'),
        coalesce(rec.last_name,  'Client'),
        null   -- auth.users already gone, email not recoverable
      )
      returning id into v_stub_id;

      update public.session_notes
      set stub_id = v_stub_id
      where user_id = rec.id;
    end if;

    delete from public.users where id = rec.id;
  end loop;
end;
$$;
