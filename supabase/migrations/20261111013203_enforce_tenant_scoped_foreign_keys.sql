-- Enforce same-tenant references for all public-to-public foreign keys.
do $$
declare
 r record;
 uq_name text;
 fk_name text;
begin
 for r in
  select child.relname as child_table, child_col.attname as child_column, parent.relname as parent_table
  from pg_constraint fk
  join pg_class child on child.oid=fk.conrelid
  join pg_namespace child_ns on child_ns.oid=child.relnamespace
  join pg_class parent on parent.oid=fk.confrelid
  join pg_namespace parent_ns on parent_ns.oid=parent.relnamespace
  join pg_attribute child_col on child_col.attrelid=child.oid and child_col.attnum=fk.conkey[1]
  join pg_attribute parent_col on parent_col.attrelid=parent.oid and parent_col.attnum=fk.confkey[1]
  where fk.contype='f' and child_ns.nspname='public' and parent_ns.nspname='public'
   and cardinality(fk.conkey)=1 and cardinality(fk.confkey)=1
   and parent_col.attname='id' and child_col.attname<>'hospital_id' and parent.relname<>'hospitals'
 loop
  uq_name:='uq_'||r.parent_table||'_hospital_id';
  if not exists(select 1 from pg_constraint c join pg_class t on t.oid=c.conrelid
    join pg_namespace n on n.oid=t.relnamespace
    where n.nspname='public' and t.relname=r.parent_table and c.conname=uq_name) then
   execute format('alter table public.%I add constraint %I unique (hospital_id,id)',r.parent_table,uq_name);
  end if;
  fk_name:='fk_tenant_'||r.child_table||'_'||r.child_column;
  if not exists(select 1 from pg_constraint c join pg_class t on t.oid=c.conrelid
    join pg_namespace n on n.oid=t.relnamespace
    where n.nspname='public' and t.relname=r.child_table and c.conname=fk_name) then
   execute format('alter table public.%I add constraint %I foreign key (hospital_id,%I) references public.%I (hospital_id,id) not valid',
    r.child_table,fk_name,r.child_column,r.parent_table);
   execute format('alter table public.%I validate constraint %I',r.child_table,fk_name);
  end if;
 end loop;
end $$;
