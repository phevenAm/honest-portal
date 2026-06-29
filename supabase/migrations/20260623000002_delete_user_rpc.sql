-- RPC for admins to fully delete a user (auth + public cascade).
-- Deleting directly from public.users leaves the auth.users record intact.
-- This function runs as the DB owner (security definer) so it can reach auth.users.
create or replace function public.delete_user_by_id(target_user_id uuid)
returns void as $func$
begin
  if not exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Unauthorized';
  end if;

  delete from public.users where id = target_user_id;
  delete from auth.users where id = target_user_id;
end;
$func$ language plpgsql security definer;
