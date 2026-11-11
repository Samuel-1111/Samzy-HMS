-- Private Storage buckets and realtime feeds for operational queues/messages.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
 ('clinical-documents','clinical-documents',false,20971520,array['application/pdf','image/jpeg','image/png','image/webp']),
 ('patient-photos','patient-photos',false,5242880,array['image/jpeg','image/png','image/webp']),
 ('public-site-assets','public-site-assets',true,5242880,array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict(id) do nothing;

create policy clinical_documents_staff_read on storage.objects for select to authenticated
using(bucket_id='clinical-documents' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and app_private.has_role(array['staff']));
create policy clinical_documents_patient_released_read on storage.objects for select to authenticated
using(bucket_id='clinical-documents' and exists(select 1 from public.file_assets f where f.bucket_id=storage.objects.bucket_id and f.object_path=storage.objects.name and f.hospital_id=app_private.current_hospital_id() and f.patient_visible=true and f.patient_id is not null and app_private.owns_patient(f.patient_id)));
create policy clinical_documents_staff_insert on storage.objects for insert to authenticated
with check(bucket_id='clinical-documents' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and app_private.has_role(array['staff']));

create policy patient_photos_staff_read on storage.objects for select to authenticated
using(bucket_id='patient-photos' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and app_private.has_role(array['admin','receptionist','staff']));
create policy patient_photos_patient_read on storage.objects for select to authenticated
using(bucket_id='patient-photos' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and (storage.foldername(name))[2] is not null and app_private.owns_patient(((storage.foldername(name))[2])::uuid));
create policy patient_photos_reception_insert on storage.objects for insert to authenticated
with check(bucket_id='patient-photos' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and app_private.has_role(array['admin','receptionist']));
create policy patient_photos_reception_update on storage.objects for update to authenticated
using(bucket_id='patient-photos' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and app_private.has_role(array['admin','receptionist']))
with check(bucket_id='patient-photos' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and app_private.has_role(array['admin','receptionist']));

create policy public_site_assets_anon_read on storage.objects for select to anon using(bucket_id='public-site-assets');
create policy public_site_assets_auth_read on storage.objects for select to authenticated using(bucket_id='public-site-assets');
create policy public_site_assets_admin_insert on storage.objects for insert to authenticated
with check(bucket_id='public-site-assets' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and app_private.has_role(array['admin']));
create policy public_site_assets_admin_update on storage.objects for update to authenticated
using(bucket_id='public-site-assets' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and app_private.has_role(array['admin']))
with check(bucket_id='public-site-assets' and (storage.foldername(name))[1]=app_private.current_hospital_id()::text and app_private.has_role(array['admin']));

do $$
declare t text;
begin
 for t in select unnest(array['appointments','department_visits','queue_entries','referrals','referral_events','patient_messages','notifications'])
 loop
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
   execute format('alter publication supabase_realtime add table public.%I',t);
  end if;
 end loop;
end $$;
