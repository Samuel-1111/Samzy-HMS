-- Security hardening and updated_at maintenance triggers.
alter function app_private.current_hospital_id() set search_path = '';
alter function app_private.current_role() set search_path = '';
alter function app_private.has_role(text[]) set search_path = '';
alter function app_private.owns_patient(uuid) set search_path = '';
alter function app_private.reject_clinical_history_mutation() set search_path = '';

create or replace function app_private.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end $$;
revoke all on function app_private.set_updated_at() from public, anon, authenticated;

do $$
declare t text;
begin
 for t in
  select table_name from information_schema.columns
  where table_schema='public' and column_name='updated_at'
 loop
  execute format('create trigger %I before update on public.%I for each row execute function app_private.set_updated_at()', 'trg_'||t||'_updated_at', t);
 end loop;
end $$;
