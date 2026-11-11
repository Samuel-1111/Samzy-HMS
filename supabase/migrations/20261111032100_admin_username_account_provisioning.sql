alter table public.user_profiles
  add column if not exists login_username text,
  add column if not exists must_change_password boolean not null default false;

create unique index if not exists user_profiles_hospital_login_username_uidx
  on public.user_profiles (hospital_id, lower(login_username))
  where login_username is not null;

create unique index if not exists user_profiles_one_admin_per_hospital_uidx
  on public.user_profiles (hospital_id)
  where role = 'admin';

create unique index if not exists user_profiles_one_staff_login_per_hospital_uidx
  on public.user_profiles (hospital_id)
  where role = 'staff';
