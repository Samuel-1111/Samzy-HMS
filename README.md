# Samzy HMS
**Hospital Management System built by Samzy Technology.**

Reusable hospital operations platform. The first demonstration tenant is configured with publicly listed information for **Coxwell Specialist Hospital, Abeokuta**. Coxwell is a prospect only, not a confirmed customer or project partner. This independent prototype is not an official hospital website and is not approved for clinical use.

## Frontend coverage
- Public hospital website: /
- Admin portal: /admin (21 management sections)
- Receptionist portal: /reception
- Shared Staff portal: /staff
- Patient portal: /patient (responsive mobile-first layout)
- Shared portal navigation, search, demo forms, sample patient/queue tables and configuration views.

## Important implementation boundary
The frontend uses fictional demonstration data and local component state. Supabase Auth, PostgreSQL, RLS, private Storage, realtime queues, payments, SMS/email, CCTV integration and production role enforcement are not connected. Demo forms do not write to a database. Never enter real patient information or use this prototype for clinical operations.

## Run locally
Requires Node.js 20.9+ and npm.
    npm install
    cp .env.example .env.local
    npm run dev
Open http://localhost:3000.

## Quality checks
    npm run typecheck
    npm run lint
    npm run build

Never commit secrets, service-role keys, patient data, medical documents or production environment files. This repository is public. Configure secrets only in encrypted hosting settings. See docs/architecture.md and docs/clinical-workflows.md.
