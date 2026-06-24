-- Recreate the handle_new_user trigger function with a known-good version.
-- This fires AFTER INSERT on auth.users and creates the matching public.users row.
-- Uses NULLIF to safely handle empty strings from the signup form metadata.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, first_name, last_name, dob, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'first_name', ''),
    nullif(new.raw_user_meta_data->>'last_name', ''),
    nullif(new.raw_user_meta_data->>'dob', '')::date,
    'client'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate the trigger in case it was dropped or points to the wrong function.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
