drop policy bed_assignments_manage on public.bed_assignments;
create policy bed_assignments_insert on public.bed_assignments for insert to authenticated
with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy bed_assignments_update on public.bed_assignments for update to authenticated
using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']))
with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
