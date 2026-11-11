-- CCTV has been removed from Samzy HMS. Drop the feature's dedicated tables.
drop table if exists public.cctv_access_logs;
drop table if exists public.cctv_cameras;
