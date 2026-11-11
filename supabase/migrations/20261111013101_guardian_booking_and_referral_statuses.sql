-- Allow guardian accounts to book for linked dependants and expand referral states.
create or replace function app_private.can_book_patient(target_patient_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
 select auth.uid() is not null and (
  exists(select 1 from public.patients p where p.id=target_patient_id
   and p.hospital_id=app_private.current_hospital_id() and p.auth_user_id=auth.uid())
  or exists(select 1 from public.patient_guardians g where g.patient_id=target_patient_id
   and g.hospital_id=app_private.current_hospital_id() and g.guardian_auth_user_id=auth.uid()
   and g.can_book_appointments=true and (g.valid_until is null or g.valid_until>now()))
 )
$$;
revoke all on function app_private.can_book_patient(uuid) from public, anon;
grant execute on function app_private.can_book_patient(uuid) to authenticated;
drop policy appointments_insert on public.appointments;
create policy appointments_insert on public.appointments for insert to authenticated
with check(hospital_id=app_private.current_hospital_id()
 and (app_private.has_role(array['admin','receptionist'])
  or (app_private.has_role(array['patient']) and app_private.can_book_patient(patient_id))));
alter table public.referrals drop constraint if exists referrals_status_check;
alter table public.referrals add constraint referrals_status_check
check(status in ('awaiting_arrival','received','acknowledged','accepted','in_progress','completed','declined','cancelled'));
