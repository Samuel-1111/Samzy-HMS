# Samzy HMS

**Hospital Management System by Samzy Technology.**

Samzy HMS is being built as a reusable, tenant-isolated hospital operations platform. No hospital tenant is configured yet. No hospital branding, public contact details or operational records have been seeded.

## Current infrastructure

- Supabase project: `Samzy HMS`
- Project reference: `nbumcghfpyurtuatarac`
- Region: `eu-west-1`
- Database: PostgreSQL 17
- Versioned database migrations: `supabase/migrations/`
- Core relational tables: 44
- Row Level Security: enabled on every public table
- Tenant-scoped foreign keys: enforced
- Security advisor: no current security lint findings
- Storage buckets: 3 configured; zero stored objects
- Realtime feeds: 7 operational tables configured
- Seed data: none; all 44 public tables were verified empty after provisioning
- Generated TypeScript database types: `src/types/database.ts`
- Supabase API health endpoint: `/api/health/supabase`
- Supabase SSR Auth clients, session refresh middleware and role guards: added
- One-time, token-protected hospital bootstrap route: added but not invoked

## Important implementation boundary

The database, RLS, private Storage foundations, Realtime publication and Supabase Auth integration code are provisioned. No hospital tenant or user accounts exist yet. The portal shells remain intentionally non-operational until the hospital is approved/configured and all workflows are implemented and acceptance-tested. Do not use this deployment for real patient care yet.

## Account model

- Admin: individual accounts.
- Receptionist: individual accounts.
- Staff Portal: one shared staff login, with manually entered author name and dynamically configured department. This does not independently verify the human author.
- Patient: individual account linked to a permanent Patient ID; guardian/dependant relationships are separately permissioned.
- Patient messages are restricted to Reception.
- Clinical records are append-only; corrections use separate amendment records.
- Patient-facing clinical documents require explicit release flags.

Role and tenant claims are assigned only by trusted server-side provisioning in Supabase Auth `app_metadata`. Never trust user-editable metadata for authorisation.

## Local setup

Requires Node.js 22+ and npm.

    npm install
    cp .env.example .env.local
    npm run dev

The publishable key is safe for public application configuration. Never expose `SUPABASE_SECRET_KEY` or `HMS_BOOTSTRAP_TOKEN` in browser code or a `NEXT_PUBLIC_*` variable.

## Quality checks

    npm run typecheck
    npm run lint
    npm run build

GitHub Actions runs the checks and commits the generated npm lockfile on the development branch.

## Production blockers

- Configure and verify the Vercel environment variables.
- Configure email/SMS verification and account activation.
- Provision the approved hospital tenant and first administrator through the protected bootstrap route.
- Build the full admin, reception, shared staff and patient workflows against the typed database.
- Add server-side authorization to every mutation and test RLS boundaries.
- Complete storage upload/download flows and signed URL expiry tests.
- Complete clinical review, audit-read logging, backup/restore drills, monitoring, retention and downtime procedures.
- Complete hospital-specific privacy/legal review and clinical sign-off.
- Run end-to-end acceptance tests before enabling clinical production.

Never commit secrets, patient data, medical documents or production environment files.
