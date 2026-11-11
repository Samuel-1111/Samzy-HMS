# Clinical Workflow Acceptance Criteria

## Reception
- Search by name, phone or Patient ID.
- Show duplicate candidates before registration; never auto-merge.
- Generate Patient ID independently of phone number.
- Optional profile photo stored privately.
- Capture NHIA/HMO/other coverage without assuming all services are covered.
- Check in and create encounter plus nursing queue entry.

## Nursing
- Open patient from nursing queue and reuse existing profile.
- Optional observations with units: weight kg, height cm, BMI derived, BP mmHg, temperature C, pulse bpm, respiratory rate/min, SpO2 %, glucose with units, pain score 0-10, consciousness and notes.
- Save timestamped assessment linked to patient and encounter.
- Blood group marked verified only with evidence.
- Complete nursing stage to move patient to doctor queue.

## Doctor
- See waiting list and open existing patient profile.
- Display previous history and latest nursing assessment with timestamp and author label.
- Start consultation explicitly; record findings, diagnoses, prescriptions and investigations.
- Optional referral immediately before saving.
- No referral: complete department visit and advance queue.
- Referral: create destination workflow; keep encounter open until downstream services finish.

## Referral
Track Sent, Awaiting Arrival, Acknowledged, Accepted, In Progress, Completed, Declined and Cancelled. Destination department acknowledges arrival before active queue. Preserve source/destination departments, reason, instructions, priority, author label and event history.

## Patient portal
Mobile-first with no horizontal overflow. Show only explicitly released records, prescriptions, lab results and discharge instructions. Appointment requests require Reception review. Patient messages go only to Reception. Urgent symptoms must direct patients to call emergency services/hospital, not wait for portal reply. Support dependants and guardians.

## Security acceptance
Server-side role checks and RLS; patient can access only their own released data; every row and file tenant-scoped; amendments preserve original entry; audit record access and changes; disclose shared staff login attribution limitation; test cross-tenant denial, patient access boundaries, signed URL expiry and account suspension.
