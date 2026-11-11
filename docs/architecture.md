# Samzy HMS Architecture

## Tenant boundary

The database is reusable and tenant-scoped through `hospital_id` on operational tables. No tenant row or hospital-specific branding is currently configured. Do not assume any hospital has approved or commissioned this product.

## Stack

- Next.js App Router, React and TypeScript
- Supabase PostgreSQL 17, Auth foundation and RLS
- Vercel deployment target (not yet connected)
- Private Storage and realtime features to be configured after authentication and access rules are completed

## Portals and account model

1. Public website — only approved hospital content may be published.
2. Admin — individual accounts.
3. Receptionist — individual accounts.
4. Staff — one shared login, manually entered author name and dynamic department selection.
5. Patient — individual account, with separately authorised guardian/dependant relationships.

Shared staff login plus a typed author name does not prove which human entered a clinical record. This is a known accountability limitation and must be explicitly accepted by the hospital or strengthened before live clinical use.

## Data model

The provisioned schema covers hospitals, profiles, departments, staff directory, patients, contacts, identifiers, guardians, insurance, appointments, encounters, department visits, queues, vitals, medical records, amendments, diagnoses, referrals and referral events, laboratory, prescriptions, dispensing, radiology, wards, beds, admissions, invoices, invoice items, payments, insurance claims, inventory, patient messages, notifications, audit logs, public content, private file metadata and CCTV configuration/access logs.

Patient = permanent identity; Encounter = one visit; Department Visit = one care stage; Queue Entry = operational position; Medical Record = append-only clinical entry; Amendment = separate correction; Referral Event = lifecycle history.

Timestamps are stored in UTC and displayed in Africa/Lagos. Phone numbers are not unique patient identifiers. Patient ID is permanent. Department name snapshots preserve historical context after a department is renamed.

## RLS and identity

Every public table has RLS enabled. Policies use signed Supabase Auth `app_metadata` claims for `hospital_id` and `role`; user-editable `user_metadata` must never determine access. Claims must be written only by trusted server-side provisioning. No users or tenant rows exist yet, so no operational access is enabled.

- Admin and Reception manage identity and operational administration within their tenant.
- Staff can access clinical work areas according to the shared staff role.
- Patients can access only their own explicitly released records.
- Guardian access is separately permissioned.
- Patient messages are visible only to Reception and the relevant patient.
- CCTV configuration and access logs are admin-only.
- Clinical history is append-only, with amendments preserved separately.

## Patient journey

Reception searches/registers the patient, checks in and creates an encounter. The patient enters nursing queue. Nursing records time-stamped observations. The patient proceeds to doctor queue. The doctor reviews history and nursing assessment, records care and may refer the patient to another department. A referral creates a destination workflow but does not prove physical arrival. The encounter remains open until downstream services finish.

## Privacy and operational safeguards

- No real patient data in development.
- Private Storage, signed URLs and explicit patient release required.
- Audit events must record access and material changes without duplicating clinical payloads.
- Backups, restore drills, retention, incident response and downtime procedures are mandatory.
- Review Nigeria Data Protection Act 2023 and applicable health-sector requirements with qualified professionals.
- Clinical forms and workflows require qualified hospital review.
- CCTV requires approved NVR/VMS integration, access controls, audit trails and privacy review. No browser-only LAN discovery or public camera feeds.

## Delivery gate

Database foundation is provisioned. Authentication, application integration, clinical workflows, hospital configuration, external integrations, Vercel deployment and end-to-end acceptance testing are not yet complete. Do not represent the system as production-ready until those gates pass.
