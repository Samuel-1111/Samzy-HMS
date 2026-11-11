# Samzy HMS

**Hospital Management System built by Samzy Technology.**

A reusable hospital operations platform. The first demonstration tenant is configured with publicly listed details for **Coxwell Specialist Hospital, Abeokuta**.

> Coxwell is a prospect for the first demonstration, not a confirmed customer or project partner. This prototype is not approved for clinical use. Use fictional data only. Do not enter real patient information. Obtain written permission and validate workflows with the hospital before any pilot.

## Current status
- Phase 1: repository and application foundation
- Responsive Admin dashboard shell with fictional queue preview
- Public hospital profile configuration
- Architecture and clinical workflow baseline documented
- Authentication, database, RLS, storage and realtime are not connected yet

## Run locally
Requirements: Node.js 20.9+ and npm.

    npm install
    cp .env.example .env.local
    npm run dev

Open http://localhost:3000.

## Quality checks
    npm run typecheck
    npm run lint
    npm run build

Never commit secrets, service-role keys, patient data, medical documents or production environment files. This repository is public. Configure secrets only in encrypted hosting settings. Do not use this prototype for real clinical operations.

See docs/architecture.md and docs/clinical-workflows.md.
