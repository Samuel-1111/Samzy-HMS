-- Guardian/dependant access, referral lifecycle, department snapshots and metadata-only audit events.
create table public.patient_guardians (
 id uuid primary key default gen_random_uuid(),
 hospital_id uuid not null references public.hospitals(id),
 patient_id uuid not null references public.patients(id),
 guardian_auth_user_id uuid not null references auth.users(id) on delete restrict,
 relationship text not null,
 can_view_records boolean not null default false,
 can_book_appointments boolean not null default true,
 valid_from timestamptz not null default now(),
 valid_until timestamptz,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 unique(hospital_id,patient_id,guardian_auth_user_id)
);
alter table public.patient_guardians enable row level security;
create policy patient_guardians_read on public.patient_guardians for select to authenticated
using (hospital_id=app_private.current_hospital_id()
 and (guardian_auth_user_id=(select auth.uid()) or app_private.has_role(array['admin','receptionist'])));
create policy patient_guardians_manage on public.patient_guardians for all to authenticated
using (hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']))
with check (hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist']));

create or replace function app_private.owns_patient(target_patient_id uuid)
returns boolean language plpgsql stable security definer set search_path = ''
as $$
begin
 if auth.uid() is null then return false; end if;
 return exists(select 1 from public.patients p where p.id=target_patient_id
   and p.hospital_id=app_private.current_hospital_id() and p.auth_user_id=auth.uid())
 or exists(select 1 from public.patient_guardians g where g.patient_id=target_patient_id
   and g.hospital_id=app_private.current_hospital_id() and g.guardian_auth_user_id=auth.uid()
   and g.can_view_records=true and (g.valid_until is null or g.valid_until>now()));
end $$;
revoke all on function app_private.owns_patient(uuid) from public, anon;
grant execute on function app_private.owns_patient(uuid) to authenticated;

drop policy patients_read on public.patients;
create policy patients_read on public.patients for select to authenticated
using (hospital_id=app_private.current_hospital_id()
 and (app_private.has_role(array['admin','receptionist','staff']) or app_private.owns_patient(id)));

create table public.referral_events (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals(id),
 referral_id uuid not null references public.referrals(id),
 event_type text not null check(event_type in ('sent','awaiting_arrival','acknowledged','accepted','in_progress','completed','declined','cancelled')),
 details text, actor_user_id uuid references auth.users(id), author_name text, created_at timestamptz not null default now()
);
alter table public.referral_events enable row level security;
create policy referral_events_read on public.referral_events for select to authenticated
using (hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist','staff']));
create policy referral_events_insert on public.referral_events for insert to authenticated
with check (hospital_id=app_private.current_hospital_id() and app_private.has_role(array['admin','receptionist','staff']));

alter table public.department_visits add column department_name_snapshot text;
alter table public.queue_entries add column department_name_snapshot text;
alter table public.vitals add column department_name_snapshot text;
alter table public.medical_records add column department_name_snapshot text;
alter table public.referrals add column source_department_name_snapshot text;
alter table public.referrals add column destination_department_name_snapshot text;

create or replace function app_private.write_audit_event()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare row_data jsonb; tenant_id uuid; row_id uuid;
begin
 if auth.uid() is null and coalesce(auth.jwt()->>'role','') <> 'service_role' then
   raise exception 'A verified application identity is required for audited changes.';
 end if;
 if tg_op='DELETE' then row_data:=to_jsonb(old); else row_data:=to_jsonb(new); end if;
 tenant_id:=coalesce(nullif(row_data->>'hospital_id','')::uuid,nullif(row_data->>'id','')::uuid);
 row_id:=nullif(row_data->>'id','')::uuid;
 if tenant_id is null then raise exception 'Audit tenant could not be resolved.'; end if;
 insert into public.audit_logs(hospital_id,actor_user_id,action,resource_type,resource_id,outcome,metadata)
 values(tenant_id,auth.uid(),lower(tg_op),tg_table_name,row_id,'success',
        jsonb_build_object('source','database_trigger','schema',tg_table_schema));
 return null;
end $$;
revoke all on function app_private.write_audit_event() from public, anon, authenticated;

do $$
declare t text;
begin
 for t in select tablename from pg_tables where schemaname='public' and tablename<>'audit_logs'
 loop
  execute format('create trigger %I after insert or update or delete on public.%I for each row execute function app_private.write_audit_event()','trg_audit_'||t,t);
 end loop;
end $$;
create index patient_guardians_user_idx on public.patient_guardians(hospital_id,guardian_auth_user_id,valid_until);
create index referral_events_timeline_idx on public.referral_events(hospital_id,referral_id,created_at);
create index audit_logs_timeline_idx on public.audit_logs(hospital_id,occurred_at desc);
