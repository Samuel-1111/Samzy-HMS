-- Keep initial tenant creation rollback-safe; successful bootstrap is managed by the trusted setup workflow.
drop trigger if exists trg_audit_hospitals on public.hospitals;
