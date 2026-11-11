-- Remove redundant single-column references where stronger tenant composite FKs exist,
-- then index all remaining FK column sets for joins and referential actions.
do $$
declare r record;
begin
 for r in
  select fk.conname, child.relname as child_table
  from pg_constraint fk
  join pg_class child on child.oid=fk.conrelid join pg_namespace cn on cn.oid=child.relnamespace
  join pg_class parent on parent.oid=fk.confrelid join pg_namespace pn on pn.oid=parent.relnamespace
  join pg_attribute ca on ca.attrelid=child.oid and ca.attnum=fk.conkey[1]
  join pg_attribute pa on pa.attrelid=parent.oid and pa.attnum=fk.confkey[1]
  where fk.contype='f' and cn.nspname='public' and pn.nspname='public'
   and cardinality(fk.conkey)=1 and cardinality(fk.confkey)=1
   and pa.attname='id' and ca.attname<>'hospital_id' and parent.relname<>'hospitals'
   and exists(select 1 from pg_constraint composite
    where composite.contype='f' and composite.conrelid=fk.conrelid and composite.confrelid=fk.confrelid
     and cardinality(composite.conkey)=2 and composite.conkey[2]=fk.conkey[1])
 loop
  execute format('alter table public.%I drop constraint %I',r.child_table,r.conname);
 end loop;
end $$;

do $$
declare r record; cols text; idx_name text;
begin
 for r in
  select c.conrelid,c.conname,c.conkey,t.relname as child_table
  from pg_constraint c join pg_class t on t.oid=c.conrelid
  join pg_namespace n on n.oid=t.relnamespace
  where c.contype='f' and n.nspname='public'
 loop
  if not exists(select 1 from pg_index i where i.indrelid=r.conrelid and i.indisvalid
    and (select array_agg(k.attnum::smallint order by k.ord)
         from unnest(i.indkey) with ordinality k(attnum,ord)
         where k.ord<=cardinality(r.conkey))=r.conkey) then
   select string_agg(format('%I',a.attname),', ' order by k.ord) into cols
   from unnest(r.conkey) with ordinality k(attnum,ord)
   join pg_attribute a on a.attrelid=r.conrelid and a.attnum=k.attnum;
   idx_name:=left('ixfk_'||r.child_table||'_'||substr(md5(r.conname),1,10),63);
   execute format('create index %I on public.%I (%s)',idx_name,r.child_table,cols);
  end if;
 end loop;
end $$;
