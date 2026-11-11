# Samzy HMS

**Hospital Management System by Samzy Technology.**

Samzy HMS is being built as a reusable, tenant-isolated hospital operations platform. No hospital tenant is configured yet. No hospital branding, public contact details or operational records have been seeded.

## Current infrastructure

- Supabase project: `Samzy HMS`
- Project reference: `nbumcghfpyurtuatarac`
- Region: `eu-west-1`
- Database: PostgreSQL 17
- Baseline schema migration: `20261111012748`
- Core relational tables: 44
- Row Level Security: enabled on every public table
- Seed data: none; all 44 tables were verified empty after provisioning
- Generated TypeScript database types: `src/types/database.ts`
- Supabase connection health endpoint: `/api/health/supabase`

## Important implementation boundary

The database schema and access policies are provisioned. The Next.js application is **not yet fully authenticated or operational**. Portal routes remain locked until Supabase SSR authentication, server-side role checks, account provisioning, storage policies and the complete workflows are implemented and tested. Do not use this deployment for real patient care yet.

## Architecture

- Admin: individual accounts.
- Receptionist: individual accounts.
- Staff Portal: one shared staff login, with manually entered author name and dynamically configured department. This does not independently verify the human author.
- Patient: individual account, linked to a permanent patient ID. Guardian/dependant relationships are represented separately.
- Patient messages are restricted to Reception.
- Clinical records are append-only; corrections use separate amendment records.
- Patient-facing clinical documents require explicit release flags.

Role and tenant claims must be assigned only by trusted server-side provisioning in Supabase Auth `app_metadata`. Never trust user-editable metadata for authorisation.

## Local setup

Requires Node.js 20.9+ and npm.

    npm install
    cp .env.example .env.local
    npm run dev

The publishable key is safe for public application configuration. Never expose a Supabase secret/service-role key in browser code or a `NEXT_PUBLIC_*` variable.

## Quality checks

    npm run typecheck
    npm run lint
    npm run build

## Production blockers

- Complete SSR Auth and role-aware route protection.
- Implement secure account creation, suspension and recovery.
- Connect every portal workflow to the database and test RLS boundaries.
- Configure private Storage buckets and signed URLs.
- Implement durable audit-event handling and review audit coverage.
- Configure backups, restore drills, monitoring, rate limits and incident response.
- Complete hospital-specific requirements, privacy/legal review and clinical sign-off.
- Configure Vercel environment variables and verify production deployment.

Never commit secrets, patient data, medical documents or production environment files.
