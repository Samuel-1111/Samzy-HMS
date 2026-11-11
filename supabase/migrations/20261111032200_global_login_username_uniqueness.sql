drop index if exists public.user_profiles_hospital_login_username_uidx;
create unique index if not exists user_profiles_login_username_uidx
  on public.user_profiles (lower(login_username))
  where login_username is not null;
