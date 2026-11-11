# Samzy HMS Architecture Baseline

## Tenant and client boundary
The first demonstration tenant is configured with publicly published information for Coxwell Specialist Hospital, Abeokuta. Coxwell is a prospect only. This repository does not imply endorsement, a contract, access to internal workflows or permission to process patient data. Obtain written approval and validate workflows before a pilot. Development uses fictional data only.

## Proposed stack
- Next.js App Router, React and TypeScript
- Supabase PostgreSQL, Auth and private Storage (not connected yet)
- PostgreSQL Row Level Security on every exposed tenant table
- Vercel deployment (not configured yet)
- Payment and messaging integrations only after requirements and credentials are approved

## Portals
1. Public hospital website and appointment requests
2. Admin portal — individual accounts
3. Reception portal — individual accounts
4. Staff portal — one shared login, manually entered author name
5. Patient portal — individual access, mobile-first

Shared staff login cannot verify which human created a clinical entry. A manually entered author is an attribution label, not authenticated identity. This risk must be reviewed before live clinical use. Optional PIN verification is not yet approved.

## Core entities
Patient (permanent identity), Encounter (one visit), Department Visit (one care stage), Queue Entry (operational position), Nursing Assessment (time-stamped observations), Medical Record (append-only entry), Amendment (separate correction preserving original), Referral (department transfer and event history), Appointment (requested/approved schedule).

Do not combine all clinical data in one patient row. Store timestamps in UTC and render Africa/Lagos. Patient ID is unique; phone number is not a unique medical identity. Support dependants and shared family phone numbers.

## Confirmed patient journey
Reception finds/registers patient, checks in and creates encounter. Patient enters nursing queue. Nursing saves time-stamped observations and completes the nursing stage. Patient enters doctor queue. Doctor opens the same profile and sees previous history and current nursing assessment. Doctor records consultation and may create referral. Referral creates destination workflow but does not imply physical arrival. Without referral, department visit completes. Overall encounter stays open while further services are pending. Queue advancement requires explicit completion; do not infer departure from CCTV or browser activity.

## Security and privacy baseline
- Tenant isolation enforced in database, not only UI.
- RLS on all exposed tables.
- Never expose service-role credentials in browser code or NEXT_PUBLIC variables.
- Private Storage and short-lived signed URLs for medical documents.
- Audit access and material changes; preserve amendments.
- MFA for privileged accounts where feasible.
- Backups, restore tests, retention, incident response and downtime procedures.
- Review Nigeria Data Protection Act 2023 and applicable health-sector requirements with qualified professionals.
- Clinical forms require qualified hospital review.

## CCTV (later optional phase)
Browser JavaScript cannot perform unrestricted LAN device discovery. Use an approved local discovery agent or compatible NVR/VMS integration (ONVIF where supported). Require authorised credentials, access controls, audit trails, retention limits and privacy review. No cameras in toilets/private spaces; no public feeds.

## Delivery sequence
Foundation; auth/tenant configuration/schema/RLS; Admin and Reception; Staff/Nursing/queues; lab/pharmacy/radiology/admissions/billing/inventory; patient portal; public website; integrations, security review and end-to-end tests. No stage is production-ready until permissions, logs and workflows have been tested.
