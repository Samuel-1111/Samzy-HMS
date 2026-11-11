# Supabase Connection — Samzy HMS

## Target project

- Project: Samzy HMS
- Reference: `nbumcghfpyurtuatarac`
- API URL: `https://nbumcghfpyurtuatarac.supabase.co`
- Region: EU West (`eu-west-1`)
- Database engine: PostgreSQL 17
- Applied migration: `20261111012748_samzy_hms_initial_schema`
- Follow-up migration: guardians, referral events, audit triggers and updated-at triggers

## Application environment

Set these values in local `.env.local` and the Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` — server-only secret, required only by trusted server-side account provisioning. Never expose it to browser code or commit its value.

The publishable key is intentionally public. RLS is the security boundary; a publishable key is not an authorisation mechanism.

## Identity claims

RLS policies require signed Auth `app_metadata` values:
- `hospital_id`: UUID of the hospital tenant
- `role`: one of `admin`, `receptionist`, `staff`, `patient`

These claims must be written only by a trusted server-side administrative process. Do not use `user_metadata` for role or tenant authorization. No tenant, account or sample data is currently provisioned.

## Health endpoint

`GET /api/health/supabase` performs a non-mutating request against the published-content API to verify the configured API endpoint is reachable. It does not prove Auth, RLS role claims, private Storage, or clinical workflows are ready.

## Data state

All 44 public tables were verified with RLS enabled and zero rows immediately after schema creation. No Divine Blossom project or data is used by Samzy HMS.
