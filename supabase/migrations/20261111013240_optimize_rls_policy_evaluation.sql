-- Consolidate overlapping SELECT policies and avoid per-row auth function evaluation.
alter policy profile_self_or_admin_read on public.user_profiles
using(hospital_id=app_private.current_hospital_id() and (auth_user_id=(select auth.uid()) or app_private.has_role(array['admin'])));
alter policy notifications_read on public.notifications
using(hospital_id=app_private.current_hospital_id() and (recipient_user_id=(select auth.uid()) or (recipient_patient_id is not null and app_private.owns_patient(recipient_patient_id)) or app_private.has_role(array['admin'])));
alter policy notifications_update on public.notifications
using(hospital_id=app_private.current_hospital_id() and (recipient_user_id=(select auth.uid()) or app_private.has_role(array['admin'])))
with check(hospital_id=app_private.current_hospital_id() and (recipient_user_id=(select auth.uid()) or app_private.has_role(array['admin'])));

drop policy departments_manage on public.departments;
create policy departments_insert on public.departments for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy departments_update on public.departments for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
drop policy staff_directory_manage on public.staff_directory;
create policy staff_directory_insert on public.staff_directory for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy staff_directory_update on public.staff_directory for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
drop policy patients_reception_manage on public.patients;
create policy patients_reception_insert on public.patients for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy patients_reception_update on public.patients for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
drop policy insurance_manage on public.patient_insurance;
create policy insurance_insert on public.patient_insurance for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy insurance_update on public.patient_insurance for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
drop policy patient_guardians_manage on public.patient_guardians;
create policy patient_guardians_insert on public.patient_guardians for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy patient_guardians_update on public.patient_guardians for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
drop policy wards_manage on public.wards;
create policy wards_insert on public.wards for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy wards_update on public.wards for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
drop policy beds_manage on public.beds;
create policy beds_insert on public.beds for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy beds_update on public.beds for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
drop policy cctv_cameras_admin_manage on public.cctv_cameras;
create policy cctv_cameras_admin_insert on public.cctv_cameras for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin']));
create policy cctv_cameras_admin_update on public.cctv_cameras for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin']));
drop policy inventory_items_manage on public.inventory_items;
create policy inventory_items_admin_insert on public.inventory_items for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin']));
create policy inventory_items_admin_update on public.inventory_items for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin']));
drop policy invoice_items_manage on public.invoice_items;
create policy invoice_items_insert on public.invoice_items for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy invoice_items_update on public.invoice_items for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
drop policy invoices_manage on public.invoices;
create policy invoices_insert on public.invoices for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
create policy invoices_update on public.invoices for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));
drop policy public_content_admin_manage on public.public_site_content;
create policy public_content_admin_insert on public.public_site_content for insert to authenticated with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin']));
create policy public_content_admin_update on public.public_site_content for update to authenticated using(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin'])) with check(hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin']));

drop policy diagnoses_staff_read on public.diagnoses;
drop policy diagnoses_patient_read on public.diagnoses;
create policy diagnoses_read on public.diagnoses for select to authenticated using(hospital_id=app_private.current_hospital_id() and (app_private.has_role(array['staff']) or (patient_visible and app_private.owns_patient(patient_id))));
drop policy file_assets_staff_read on public.file_assets;
drop policy file_assets_patient_read on public.file_assets;
create policy file_assets_read on public.file_assets for select to authenticated using(hospital_id=app_private.current_hospital_id() and (app_private.has_role(array['admin','staff','receptionist']) or (patient_visible and patient_id is not null and app_private.owns_patient(patient_id))));
drop policy lab_orders_staff_read on public.lab_orders;
drop policy lab_orders_patient_read on public.lab_orders;
create policy lab_orders_read on public.lab_orders for select to authenticated using(hospital_id=app_private.current_hospital_id() and (app_private.has_role(array['staff']) or (patient_visible and app_private.owns_patient(patient_id))));
drop policy lab_results_staff_read on public.lab_results;
drop policy lab_results_patient_read on public.lab_results;
create policy lab_results_read on public.lab_results for select to authenticated using(hospital_id=app_private.current_hospital_id() and (app_private.has_role(array['staff']) or (patient_visible and exists(select 1 from public.lab_orders lo where lo.id=lab_order_id and app_private.owns_patient(lo.patient_id)))));
drop policy records_staff_read on public.medical_records;
drop policy records_patient_read on public.medical_records;
create policy medical_records_read on public.medical_records for select to authenticated using(hospital_id=app_private.current_hospital_id() and (app_private.has_role(array['staff']) or (patient_visible and app_private.owns_patient(patient_id))));
drop policy prescriptions_staff_read on public.prescriptions;
drop policy prescriptions_patient_read on public.prescriptions;
create policy prescriptions_read on public.prescriptions for select to authenticated using(hospital_id=app_private.current_hospital_id() and (app_private.has_role(array['staff']) or (patient_visible and app_private.owns_patient(patient_id))));
drop policy radiology_orders_staff_read on public.radiology_orders;
drop policy radiology_orders_patient_read on public.radiology_orders;
create policy radiology_orders_read on public.radiology_orders for select to authenticated using(hospital_id=app_private.current_hospital_id() and (app_private.has_role(array['staff']) or (patient_visible and app_private.owns_patient(patient_id))));
drop policy radiology_reports_staff_read on public.radiology_reports;
drop policy radiology_reports_patient_read on public.radiology_reports;
create policy radiology_reports_read on public.radiology_reports for select to authenticated using(hospital_id=app_private.current_hospital_id() and (app_private.has_role(array['staff']) or (patient_visible and exists(select 1 from public.radiology_orders ro where ro.id=radiology_order_id and app_private.owns_patient(ro.patient_id)))));
drop policy vitals_staff_read on public.vitals;
drop policy vitals_patient_read on public.vitals;
create policy vitals_read on public.vitals for select to authenticated using(hospital_id=app_private.current_hospital_id() and (app_private.has_role(array['staff']) or (patient_visible and app_private.owns_patient(patient_id))));
drop policy patient_messages_patient_insert on public.patient_messages;
drop policy patient_messages_reception_insert on public.patient_messages;
create policy patient_messages_insert on public.patient_messages for insert to authenticated
with check(hospital_id=app_private.current_hospital_id() and ((sender_type='patient' and sender_user_id=(select auth.uid()) and app_private.owns_patient(patient_id)) or (sender_type='receptionist' and app_private.has_role(array['admin','receptionist']))));
