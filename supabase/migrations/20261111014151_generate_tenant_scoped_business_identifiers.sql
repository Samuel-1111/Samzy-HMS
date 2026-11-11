-- Tenant-scoped, concurrency-safe patient, encounter and invoice identifiers.
create table app_private.identifier_counters (
 hospital_id uuid not null references public.hospitals(id),
 identifier_type text not null check(identifier_type in ('patient','encounter','invoice')),
 year_value integer not null,
 last_value bigint not null check(last_value>0),
 primary key(hospital_id,identifier_type,year_value)
);
create or replace function app_private.next_hospital_identifier(p_hospital_id uuid,p_identifier_type text)
returns text language plpgsql security definer set search_path = ''
as $$
declare tz text; yr integer; n bigint; prefix text;
begin
 if p_identifier_type not in ('patient','encounter','invoice') then raise exception 'Unsupported identifier type.'; end if;
 if auth.uid() is null then
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise exception 'A verified application identity is required.'; end if;
 else
  if app_private.current_hospital_id() is distinct from p_hospital_id or not app_private.has_role(array['admin','receptionist','staff']) then
   raise exception 'Not authorised to allocate an identifier for this hospital.';
  end if;
 end if;
 select h.timezone into tz from public.hospitals h where h.id=p_hospital_id;
 if tz is null then raise exception 'Hospital tenant not found.'; end if;
 yr:=extract(year from (now() at time zone tz))::integer;
 prefix:=case p_identifier_type when 'patient' then 'SH' when 'encounter' then 'ENC' else 'INV' end;
 insert into app_private.identifier_counters(hospital_id,identifier_type,year_value,last_value)
 values(p_hospital_id,p_identifier_type,yr,1)
 on conflict(hospital_id,identifier_type,year_value)
 do update set last_value=app_private.identifier_counters.last_value+1
 returning last_value into n;
 return prefix||'-'||yr::text||'-'||lpad(n::text,6,'0');
end $$;
revoke all on function app_private.next_hospital_identifier(uuid,text) from public,anon,authenticated;
grant execute on function app_private.next_hospital_identifier(uuid,text) to service_role;

create or replace function app_private.assign_hospital_identifier()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 if auth.uid() is null then
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise exception 'A verified application identity is required.'; end if;
 elsif app_private.current_hospital_id() is distinct from new.hospital_id then
  raise exception 'Hospital tenant mismatch.';
 end if;
 if tg_table_name='patients' and coalesce(new.patient_number,'')='' then
  new.patient_number:=app_private.next_hospital_identifier(new.hospital_id,'patient');
 elsif tg_table_name='encounters' and coalesce(new.encounter_number,'')='' then
  new.encounter_number:=app_private.next_hospital_identifier(new.hospital_id,'encounter');
 elsif tg_table_name='invoices' and coalesce(new.invoice_number,'')='' then
  new.invoice_number:=app_private.next_hospital_identifier(new.hospital_id,'invoice');
 end if;
 return new;
end $$;
revoke all on function app_private.assign_hospital_identifier() from public,anon,authenticated;
create trigger patients_assign_identifier before insert on public.patients for each row execute function app_private.assign_hospital_identifier();
create trigger encounters_assign_identifier before insert on public.encounters for each row execute function app_private.assign_hospital_identifier();
create trigger invoices_assign_identifier before insert on public.invoices for each row execute function app_private.assign_hospital_identifier();
