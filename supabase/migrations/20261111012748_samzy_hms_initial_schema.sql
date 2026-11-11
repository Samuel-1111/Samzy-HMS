-- Generated from the applied Samzy HMS Supabase migration.
-- Functions precede policies; this file mirrors the live schema and contains no seed data.
create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

CREATE OR REPLACE FUNCTION app_private.current_hospital_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$ select nullif(auth.jwt()->'app_metadata'->>'hospital_id','')::uuid $function$
;

CREATE OR REPLACE FUNCTION app_private."current_role"()
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$ select coalesce(auth.jwt()->'app_metadata'->>'role','') $function$
;

CREATE OR REPLACE FUNCTION app_private.has_role(allowed text[])
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$ select app_private.current_role() = any(allowed) $function$
;

CREATE OR REPLACE FUNCTION app_private.owns_patient(target_patient_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
begin
 return exists(select 1 from public.patients p where p.id=target_patient_id
   and p.auth_user_id=auth.uid() and p.hospital_id=app_private.current_hospital_id());
end $function$
;

CREATE OR REPLACE FUNCTION app_private.reject_clinical_history_mutation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin raise exception 'Clinical history is append-only; add an amendment instead.'; end $function$
;

create table public.admissions (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid not null,
  admitted_by uuid,
  admission_reason text not null,
  status text default 'admitted'::text not null,
  patient_visible boolean default false not null,
  admitted_at timestamp with time zone default now() not null,
  discharged_at timestamp with time zone,
  discharge_instructions text,
  constraint admissions_admitted_by_fkey FOREIGN KEY (admitted_by) REFERENCES auth.users(id),
  constraint admissions_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint admissions_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint admissions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint admissions_pkey PRIMARY KEY (id),
  constraint admissions_status_check CHECK (status = ANY (ARRAY['admitted'::text, 'discharged'::text, 'transferred'::text, 'cancelled'::text]))
);

create table public.appointments (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  department_id uuid,
  requested_at timestamp with time zone default now() not null,
  scheduled_at timestamp with time zone,
  reason text,
  status text default 'requested'::text not null,
  receptionist_notes text,
  reviewed_by uuid,
  created_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint appointments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  constraint appointments_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id),
  constraint appointments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint appointments_pkey PRIMARY KEY (id),
  constraint appointments_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id),
  constraint appointments_status_check CHECK (status = ANY (ARRAY['requested'::text, 'approved'::text, 'rescheduled'::text, 'declined'::text, 'cancelled'::text, 'completed'::text, 'no_show'::text]))
);

create table public.audit_logs (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  actor_user_id uuid,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  outcome text default 'success'::text not null,
  request_id text,
  metadata jsonb default '{}'::jsonb not null,
  occurred_at timestamp with time zone default now() not null,
  constraint audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id),
  constraint audit_logs_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint audit_logs_outcome_check CHECK (outcome = ANY (ARRAY['success'::text, 'denied'::text, 'failure'::text])),
  constraint audit_logs_pkey PRIMARY KEY (id)
);

create table public.bed_assignments (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  admission_id uuid not null,
  bed_id uuid not null,
  assigned_at timestamp with time zone default now() not null,
  released_at timestamp with time zone,
  patient_visible boolean default false not null,
  constraint bed_assignments_admission_id_fkey FOREIGN KEY (admission_id) REFERENCES admissions(id),
  constraint bed_assignments_bed_id_fkey FOREIGN KEY (bed_id) REFERENCES beds(id),
  constraint bed_assignments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint bed_assignments_pkey PRIMARY KEY (id)
);

create table public.beds (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  ward_id uuid not null,
  bed_number text not null,
  status text default 'available'::text not null,
  created_at timestamp with time zone default now() not null,
  constraint beds_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint beds_hospital_id_ward_id_bed_number_key UNIQUE (hospital_id, ward_id, bed_number),
  constraint beds_pkey PRIMARY KEY (id),
  constraint beds_status_check CHECK (status = ANY (ARRAY['available'::text, 'occupied'::text, 'reserved'::text, 'maintenance'::text, 'inactive'::text])),
  constraint beds_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES wards(id)
);

create table public.cctv_access_logs (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  camera_id uuid,
  accessed_by uuid,
  action text not null,
  purpose text,
  occurred_at timestamp with time zone default now() not null,
  constraint cctv_access_logs_accessed_by_fkey FOREIGN KEY (accessed_by) REFERENCES auth.users(id),
  constraint cctv_access_logs_camera_id_fkey FOREIGN KEY (camera_id) REFERENCES cctv_cameras(id),
  constraint cctv_access_logs_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint cctv_access_logs_pkey PRIMARY KEY (id)
);

create table public.cctv_cameras (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  camera_name text not null,
  location_label text not null,
  integration_type text,
  external_camera_id text,
  is_enabled boolean default false not null,
  created_at timestamp with time zone default now() not null,
  constraint cctv_cameras_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint cctv_cameras_pkey PRIMARY KEY (id)
);

create table public.department_visits (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  encounter_id uuid not null,
  patient_id uuid not null,
  department_id uuid not null,
  status text default 'waiting'::text not null,
  priority text default 'normal'::text not null,
  patient_visible boolean default false not null,
  checked_in_at timestamp with time zone default now() not null,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  assigned_staff_id uuid,
  created_at timestamp with time zone default now() not null,
  constraint department_visits_assigned_staff_id_fkey FOREIGN KEY (assigned_staff_id) REFERENCES staff_directory(id),
  constraint department_visits_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id),
  constraint department_visits_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint department_visits_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint department_visits_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint department_visits_pkey PRIMARY KEY (id),
  constraint department_visits_priority_check CHECK (priority = ANY (ARRAY['normal'::text, 'urgent'::text, 'emergency'::text])),
  constraint department_visits_status_check CHECK (status = ANY (ARRAY['waiting'::text, 'called'::text, 'in_consultation'::text, 'referred'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text]))
);

create table public.departments (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  name text not null,
  code text,
  description text,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint departments_hospital_id_code_key UNIQUE (hospital_id, code),
  constraint departments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint departments_hospital_id_name_key UNIQUE (hospital_id, name),
  constraint departments_pkey PRIMARY KEY (id)
);

create table public.diagnoses (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid not null,
  medical_record_id uuid,
  code_system text,
  diagnosis_code text,
  description text not null,
  diagnosis_type text default 'working'::text not null,
  patient_visible boolean default false not null,
  recorded_by uuid,
  created_at timestamp with time zone default now() not null,
  constraint diagnoses_diagnosis_type_check CHECK (diagnosis_type = ANY (ARRAY['working'::text, 'confirmed'::text, 'differential'::text, 'historical'::text])),
  constraint diagnoses_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint diagnoses_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint diagnoses_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES medical_records(id),
  constraint diagnoses_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint diagnoses_pkey PRIMARY KEY (id),
  constraint diagnoses_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id)
);

create table public.dispensing_records (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  prescription_item_id uuid not null,
  dispensed_by uuid,
  quantity_dispensed numeric(10,2) not null,
  batch_number text,
  dispensed_at timestamp with time zone default now() not null,
  notes text,
  constraint dispensing_records_dispensed_by_fkey FOREIGN KEY (dispensed_by) REFERENCES auth.users(id),
  constraint dispensing_records_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint dispensing_records_pkey PRIMARY KEY (id),
  constraint dispensing_records_prescription_item_id_fkey FOREIGN KEY (prescription_item_id) REFERENCES prescription_items(id),
  constraint dispensing_records_quantity_dispensed_check CHECK (quantity_dispensed > 0::numeric)
);

create table public.encounters (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  appointment_id uuid,
  encounter_number text not null,
  encounter_type text default 'outpatient'::text not null,
  status text default 'open'::text not null,
  opened_at timestamp with time zone default now() not null,
  closed_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone default now() not null,
  constraint encounters_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  constraint encounters_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  constraint encounters_encounter_type_check CHECK (encounter_type = ANY (ARRAY['outpatient'::text, 'emergency'::text, 'inpatient'::text, 'follow_up'::text])),
  constraint encounters_hospital_id_encounter_number_key UNIQUE (hospital_id, encounter_number),
  constraint encounters_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint encounters_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint encounters_pkey PRIMARY KEY (id),
  constraint encounters_status_check CHECK (status = ANY (ARRAY['open'::text, 'referred'::text, 'undergoing_services'::text, 'completed'::text, 'cancelled'::text]))
);

create table public.file_assets (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid,
  bucket_id text not null,
  object_path text not null,
  file_category text not null,
  patient_visible boolean default false not null,
  uploaded_by uuid,
  created_at timestamp with time zone default now() not null,
  constraint file_assets_bucket_id_object_path_key UNIQUE (bucket_id, object_path),
  constraint file_assets_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint file_assets_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint file_assets_pkey PRIMARY KEY (id),
  constraint file_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);

create table public.hospitals (
  id uuid default gen_random_uuid() not null,
  slug text not null,
  legal_name text not null,
  display_name text not null,
  timezone text default 'Africa/Lagos'::text not null,
  currency_code character(3) default 'NGN'::bpchar not null,
  phone text,
  email text,
  address jsonb default '{}'::jsonb not null,
  settings jsonb default '{}'::jsonb not null,
  status text default 'active'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint hospitals_pkey PRIMARY KEY (id),
  constraint hospitals_slug_key UNIQUE (slug),
  constraint hospitals_status_check CHECK (status = ANY (ARRAY['active'::text, 'suspended'::text]))
);

create table public.insurance_claims (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  invoice_id uuid,
  insurance_id uuid not null,
  claim_number text,
  amount_claimed numeric(12,2) not null,
  amount_approved numeric(12,2),
  status text default 'draft'::text not null,
  submitted_at timestamp with time zone,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  constraint insurance_claims_amount_claimed_check CHECK (amount_claimed >= 0::numeric),
  constraint insurance_claims_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint insurance_claims_insurance_id_fkey FOREIGN KEY (insurance_id) REFERENCES patient_insurance(id),
  constraint insurance_claims_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  constraint insurance_claims_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint insurance_claims_pkey PRIMARY KEY (id),
  constraint insurance_claims_status_check CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'pending'::text, 'approved'::text, 'part_approved'::text, 'rejected'::text, 'paid'::text]))
);

create table public.inventory_items (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  item_name text not null,
  item_code text,
  category text,
  unit text not null,
  reorder_level numeric(12,2) default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  constraint inventory_items_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint inventory_items_hospital_id_item_code_key UNIQUE (hospital_id, item_code),
  constraint inventory_items_pkey PRIMARY KEY (id)
);

create table public.inventory_movements (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  item_id uuid not null,
  movement_type text not null,
  quantity numeric(12,2) not null,
  reference text,
  notes text,
  recorded_by uuid,
  created_at timestamp with time zone default now() not null,
  constraint inventory_movements_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint inventory_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory_items(id),
  constraint inventory_movements_movement_type_check CHECK (movement_type = ANY (ARRAY['stock_in'::text, 'stock_out'::text, 'adjustment'::text, 'dispensed'::text, 'returned'::text])),
  constraint inventory_movements_pkey PRIMARY KEY (id),
  constraint inventory_movements_quantity_check CHECK (quantity > 0::numeric),
  constraint inventory_movements_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id)
);

create table public.invoice_items (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  invoice_id uuid not null,
  description text not null,
  quantity numeric(10,2) default 1 not null,
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null,
  created_at timestamp with time zone default now() not null,
  constraint invoice_items_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  constraint invoice_items_line_total_check CHECK (line_total >= 0::numeric),
  constraint invoice_items_pkey PRIMARY KEY (id),
  constraint invoice_items_quantity_check CHECK (quantity > 0::numeric),
  constraint invoice_items_unit_price_check CHECK (unit_price >= 0::numeric)
);

create table public.invoices (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid,
  invoice_number text not null,
  subtotal numeric(12,2) default 0 not null,
  discount numeric(12,2) default 0 not null,
  total numeric(12,2) default 0 not null,
  currency_code character(3) default 'NGN'::bpchar not null,
  status text default 'unpaid'::text not null,
  issued_at timestamp with time zone default now() not null,
  due_at timestamp with time zone,
  created_by uuid,
  constraint invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  constraint invoices_discount_check CHECK (discount >= 0::numeric),
  constraint invoices_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint invoices_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint invoices_hospital_id_invoice_number_key UNIQUE (hospital_id, invoice_number),
  constraint invoices_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint invoices_pkey PRIMARY KEY (id),
  constraint invoices_status_check CHECK (status = ANY (ARRAY['unpaid'::text, 'part_paid'::text, 'paid'::text, 'void'::text])),
  constraint invoices_subtotal_check CHECK (subtotal >= 0::numeric),
  constraint invoices_total_check CHECK (total >= 0::numeric)
);

create table public.lab_orders (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid not null,
  ordered_by uuid,
  test_name text not null,
  clinical_indication text,
  priority text default 'routine'::text not null,
  status text default 'ordered'::text not null,
  patient_visible boolean default false not null,
  ordered_at timestamp with time zone default now() not null,
  constraint lab_orders_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint lab_orders_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint lab_orders_ordered_by_fkey FOREIGN KEY (ordered_by) REFERENCES auth.users(id),
  constraint lab_orders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint lab_orders_pkey PRIMARY KEY (id),
  constraint lab_orders_priority_check CHECK (priority = ANY (ARRAY['routine'::text, 'urgent'::text, 'emergency'::text])),
  constraint lab_orders_status_check CHECK (status = ANY (ARRAY['ordered'::text, 'collected'::text, 'processing'::text, 'resulted'::text, 'cancelled'::text]))
);

create table public.lab_results (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  lab_order_id uuid not null,
  result jsonb not null,
  interpretation text,
  reference_ranges jsonb default '{}'::jsonb not null,
  verified_by uuid,
  verified_at timestamp with time zone,
  patient_visible boolean default false not null,
  created_at timestamp with time zone default now() not null,
  constraint lab_results_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint lab_results_lab_order_id_fkey FOREIGN KEY (lab_order_id) REFERENCES lab_orders(id),
  constraint lab_results_pkey PRIMARY KEY (id),
  constraint lab_results_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id)
);

create table public.lab_samples (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  lab_order_id uuid not null,
  sample_type text not null,
  sample_identifier text,
  collected_by uuid,
  collected_at timestamp with time zone,
  status text default 'pending'::text not null,
  created_at timestamp with time zone default now() not null,
  constraint lab_samples_collected_by_fkey FOREIGN KEY (collected_by) REFERENCES auth.users(id),
  constraint lab_samples_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint lab_samples_lab_order_id_fkey FOREIGN KEY (lab_order_id) REFERENCES lab_orders(id),
  constraint lab_samples_pkey PRIMARY KEY (id),
  constraint lab_samples_status_check CHECK (status = ANY (ARRAY['pending'::text, 'collected'::text, 'rejected'::text, 'received'::text]))
);

create table public.medical_record_amendments (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  medical_record_id uuid not null,
  amended_by uuid,
  author_name text not null,
  reason text not null,
  amendment jsonb not null,
  created_at timestamp with time zone default now() not null,
  constraint medical_record_amendments_amended_by_fkey FOREIGN KEY (amended_by) REFERENCES auth.users(id),
  constraint medical_record_amendments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint medical_record_amendments_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES medical_records(id),
  constraint medical_record_amendments_pkey PRIMARY KEY (id)
);

create table public.medical_records (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid not null,
  department_visit_id uuid,
  department_id uuid,
  author_user_id uuid,
  author_name text not null,
  author_role text not null,
  title text not null,
  record_type text not null,
  content jsonb not null,
  patient_visible boolean default false not null,
  recorded_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  constraint medical_records_author_user_id_fkey FOREIGN KEY (author_user_id) REFERENCES auth.users(id),
  constraint medical_records_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id),
  constraint medical_records_department_visit_id_fkey FOREIGN KEY (department_visit_id) REFERENCES department_visits(id),
  constraint medical_records_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint medical_records_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint medical_records_pkey PRIMARY KEY (id),
  constraint medical_records_record_type_check CHECK (record_type = ANY (ARRAY['consultation'::text, 'clinical_note'::text, 'nursing_note'::text, 'assessment'::text, 'procedure'::text, 'discharge_summary'::text, 'other'::text]))
);

create table public.notifications (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  recipient_user_id uuid,
  recipient_patient_id uuid,
  title text not null,
  body text not null,
  channel text default 'in_app'::text not null,
  status text default 'queued'::text not null,
  sent_at timestamp with time zone,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  constraint notifications_channel_check CHECK (channel = ANY (ARRAY['in_app'::text, 'email'::text, 'sms'::text, 'push'::text])),
  constraint notifications_check CHECK (recipient_user_id IS NOT NULL OR recipient_patient_id IS NOT NULL),
  constraint notifications_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint notifications_pkey PRIMARY KEY (id),
  constraint notifications_recipient_patient_id_fkey FOREIGN KEY (recipient_patient_id) REFERENCES patients(id),
  constraint notifications_recipient_user_id_fkey FOREIGN KEY (recipient_user_id) REFERENCES auth.users(id),
  constraint notifications_status_check CHECK (status = ANY (ARRAY['queued'::text, 'sent'::text, 'failed'::text, 'read'::text]))
);

create table public.patient_contacts (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  contact_type text not null,
  label text,
  value jsonb not null,
  is_primary boolean default false not null,
  created_at timestamp with time zone default now() not null,
  constraint patient_contacts_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint patient_contacts_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint patient_contacts_pkey PRIMARY KEY (id)
);

create table public.patient_identifiers (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  identifier_type text not null,
  identifier_value text not null,
  issuing_authority text,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  constraint patient_identifiers_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint patient_identifiers_hospital_id_identifier_type_identifier__key UNIQUE (hospital_id, identifier_type, identifier_value),
  constraint patient_identifiers_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint patient_identifiers_pkey PRIMARY KEY (id)
);

create table public.patient_insurance (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  scheme_type text not null,
  provider_name text not null,
  policy_number text,
  enrollee_number text,
  member_type text,
  coverage_details jsonb default '{}'::jsonb not null,
  exclusions jsonb default '[]'::jsonb not null,
  copay_details jsonb default '{}'::jsonb not null,
  valid_from date,
  valid_until date,
  verification_status text default 'pending'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint patient_insurance_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint patient_insurance_member_type_check CHECK (member_type = ANY (ARRAY['principal'::text, 'dependent'::text, 'unknown'::text])),
  constraint patient_insurance_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint patient_insurance_pkey PRIMARY KEY (id),
  constraint patient_insurance_scheme_type_check CHECK (scheme_type = ANY (ARRAY['nhia'::text, 'hmo'::text, 'private'::text, 'other'::text])),
  constraint patient_insurance_verification_status_check CHECK (verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'expired'::text]))
);

create table public.patient_messages (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  sender_type text not null,
  sender_user_id uuid,
  message text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  constraint patient_messages_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint patient_messages_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint patient_messages_pkey PRIMARY KEY (id),
  constraint patient_messages_sender_type_check CHECK (sender_type = ANY (ARRAY['patient'::text, 'receptionist'::text])),
  constraint patient_messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES auth.users(id)
);

create table public.patients (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_number text not null,
  auth_user_id uuid,
  first_name text not null,
  middle_name text,
  last_name text not null,
  date_of_birth date,
  sex text,
  phone text,
  email text,
  address jsonb default '{}'::jsonb not null,
  photo_path text,
  emergency_contact jsonb default '{}'::jsonb not null,
  next_of_kin jsonb default '{}'::jsonb not null,
  patient_category text default 'private'::text not null,
  record_status text default 'active'::text not null,
  created_by uuid,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint patients_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint patients_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint patients_hospital_id_auth_user_id_key UNIQUE (hospital_id, auth_user_id),
  constraint patients_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint patients_hospital_id_patient_number_key UNIQUE (hospital_id, patient_number),
  constraint patients_patient_category_check CHECK (patient_category = ANY (ARRAY['nhia'::text, 'hmo'::text, 'private'::text, 'self_pay'::text])),
  constraint patients_pkey PRIMARY KEY (id),
  constraint patients_record_status_check CHECK (record_status = ANY (ARRAY['active'::text, 'deceased'::text, 'merged'::text, 'archived'::text])),
  constraint patients_sex_check CHECK (sex = ANY (ARRAY['female'::text, 'male'::text, 'intersex'::text, 'unknown'::text, 'not_recorded'::text]))
);

create table public.payments (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  invoice_id uuid not null,
  patient_id uuid not null,
  amount numeric(12,2) not null,
  currency_code character(3) default 'NGN'::bpchar not null,
  payment_method text not null,
  provider text,
  provider_reference text,
  status text default 'pending'::text not null,
  received_at timestamp with time zone,
  recorded_by uuid,
  created_at timestamp with time zone default now() not null,
  constraint payments_amount_check CHECK (amount > 0::numeric),
  constraint payments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint payments_hospital_id_provider_reference_key UNIQUE (hospital_id, provider_reference),
  constraint payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  constraint payments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint payments_payment_method_check CHECK (payment_method = ANY (ARRAY['cash'::text, 'bank_transfer'::text, 'pos'::text, 'online'::text, 'insurance'::text, 'other'::text])),
  constraint payments_pkey PRIMARY KEY (id),
  constraint payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id),
  constraint payments_status_check CHECK (status = ANY (ARRAY['pending'::text, 'successful'::text, 'failed'::text, 'reversed'::text]))
);

create table public.prescription_items (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  prescription_id uuid not null,
  medicine_name text not null,
  strength text,
  dosage text not null,
  route text,
  frequency text not null,
  duration text,
  quantity numeric(10,2),
  instructions text,
  created_at timestamp with time zone default now() not null,
  constraint prescription_items_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint prescription_items_pkey PRIMARY KEY (id),
  constraint prescription_items_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);

create table public.prescriptions (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid not null,
  prescribed_by uuid,
  instructions text,
  status text default 'pending'::text not null,
  patient_visible boolean default false not null,
  created_at timestamp with time zone default now() not null,
  constraint prescriptions_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint prescriptions_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint prescriptions_pkey PRIMARY KEY (id),
  constraint prescriptions_prescribed_by_fkey FOREIGN KEY (prescribed_by) REFERENCES auth.users(id),
  constraint prescriptions_status_check CHECK (status = ANY (ARRAY['pending'::text, 'partially_dispensed'::text, 'dispensed'::text, 'cancelled'::text]))
);

create table public.public_site_content (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  content_key text not null,
  content jsonb not null,
  is_published boolean default false not null,
  published_at timestamp with time zone,
  updated_by uuid,
  updated_at timestamp with time zone default now() not null,
  constraint public_site_content_hospital_id_content_key_key UNIQUE (hospital_id, content_key),
  constraint public_site_content_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint public_site_content_pkey PRIMARY KEY (id),
  constraint public_site_content_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

create table public.queue_entries (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  department_visit_id uuid not null,
  department_id uuid not null,
  patient_id uuid not null,
  queue_number text,
  status text default 'waiting'::text not null,
  priority text default 'normal'::text not null,
  checked_in_at timestamp with time zone default now() not null,
  called_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  constraint queue_entries_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id),
  constraint queue_entries_department_visit_id_fkey FOREIGN KEY (department_visit_id) REFERENCES department_visits(id),
  constraint queue_entries_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint queue_entries_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint queue_entries_pkey PRIMARY KEY (id),
  constraint queue_entries_priority_check CHECK (priority = ANY (ARRAY['normal'::text, 'urgent'::text, 'emergency'::text])),
  constraint queue_entries_status_check CHECK (status = ANY (ARRAY['waiting'::text, 'called'::text, 'in_service'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text]))
);

create table public.radiology_orders (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid not null,
  ordered_by uuid,
  examination text not null,
  clinical_indication text,
  status text default 'ordered'::text not null,
  patient_visible boolean default false not null,
  created_at timestamp with time zone default now() not null,
  constraint radiology_orders_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint radiology_orders_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint radiology_orders_ordered_by_fkey FOREIGN KEY (ordered_by) REFERENCES auth.users(id),
  constraint radiology_orders_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint radiology_orders_pkey PRIMARY KEY (id),
  constraint radiology_orders_status_check CHECK (status = ANY (ARRAY['ordered'::text, 'scheduled'::text, 'performed'::text, 'reported'::text, 'cancelled'::text]))
);

create table public.radiology_reports (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  radiology_order_id uuid not null,
  report text not null,
  reported_by uuid,
  verified_at timestamp with time zone,
  patient_visible boolean default false not null,
  created_at timestamp with time zone default now() not null,
  constraint radiology_reports_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint radiology_reports_pkey PRIMARY KEY (id),
  constraint radiology_reports_radiology_order_id_fkey FOREIGN KEY (radiology_order_id) REFERENCES radiology_orders(id),
  constraint radiology_reports_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES auth.users(id)
);

create table public.referrals (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid not null,
  source_department_id uuid,
  destination_department_id uuid not null,
  reason text not null,
  instructions text,
  priority text default 'normal'::text not null,
  status text default 'awaiting_arrival'::text not null,
  patient_visible boolean default false not null,
  referred_by uuid,
  received_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  constraint referrals_destination_department_id_fkey FOREIGN KEY (destination_department_id) REFERENCES departments(id),
  constraint referrals_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint referrals_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint referrals_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint referrals_pkey PRIMARY KEY (id),
  constraint referrals_priority_check CHECK (priority = ANY (ARRAY['normal'::text, 'urgent'::text, 'emergency'::text])),
  constraint referrals_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES auth.users(id),
  constraint referrals_source_department_id_fkey FOREIGN KEY (source_department_id) REFERENCES departments(id),
  constraint referrals_status_check CHECK (status = ANY (ARRAY['awaiting_arrival'::text, 'received'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))
);

create table public.staff_directory (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  auth_user_id uuid,
  department_id uuid,
  full_name text not null,
  staff_number text,
  job_title text,
  phone text,
  email text,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint staff_directory_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  constraint staff_directory_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id),
  constraint staff_directory_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint staff_directory_hospital_id_staff_number_key UNIQUE (hospital_id, staff_number),
  constraint staff_directory_pkey PRIMARY KEY (id)
);

create table public.user_profiles (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  auth_user_id uuid not null,
  role text not null,
  display_name text not null,
  phone text,
  email text,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint user_profiles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE RESTRICT,
  constraint user_profiles_hospital_id_auth_user_id_key UNIQUE (hospital_id, auth_user_id),
  constraint user_profiles_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint user_profiles_pkey PRIMARY KEY (id),
  constraint user_profiles_role_check CHECK (role = ANY (ARRAY['admin'::text, 'receptionist'::text, 'staff'::text, 'patient'::text]))
);

create table public.vitals (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  patient_id uuid not null,
  encounter_id uuid not null,
  department_visit_id uuid,
  measured_by uuid,
  author_name text not null,
  department_id uuid,
  weight_kg numeric(6,2),
  height_cm numeric(6,2),
  bmi numeric(5,2),
  systolic_bp integer,
  diastolic_bp integer,
  temperature_c numeric(4,1),
  pulse_bpm integer,
  respiratory_rate integer,
  spo2_percent numeric(5,2),
  glucose_value numeric(7,2),
  glucose_unit text,
  pain_score smallint,
  consciousness text,
  allergies jsonb default '[]'::jsonb not null,
  notes text,
  patient_visible boolean default false not null,
  measured_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  constraint vitals_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id),
  constraint vitals_department_visit_id_fkey FOREIGN KEY (department_visit_id) REFERENCES department_visits(id),
  constraint vitals_encounter_id_fkey FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  constraint vitals_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint vitals_measured_by_fkey FOREIGN KEY (measured_by) REFERENCES auth.users(id),
  constraint vitals_pain_score_check CHECK (pain_score >= 0 AND pain_score <= 10),
  constraint vitals_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id),
  constraint vitals_pkey PRIMARY KEY (id)
);

create table public.wards (
  id uuid default gen_random_uuid() not null,
  hospital_id uuid not null,
  name text not null,
  ward_type text,
  gender_policy text,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  constraint wards_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
  constraint wards_hospital_id_name_key UNIQUE (hospital_id, name),
  constraint wards_pkey PRIMARY KEY (id)
);

CREATE INDEX appointments_queue_idx ON public.appointments USING btree (hospital_id, status, scheduled_at)

CREATE INDEX department_visits_queue_idx ON public.department_visits USING btree (hospital_id, department_id, status, checked_in_at)

CREATE INDEX encounters_patient_timeline_idx ON public.encounters USING btree (hospital_id, patient_id, opened_at DESC)

CREATE INDEX invoices_patient_status_idx ON public.invoices USING btree (hospital_id, patient_id, status)

CREATE INDEX records_patient_timeline_idx ON public.medical_records USING btree (hospital_id, patient_id, recorded_at DESC)

CREATE INDEX patient_messages_conversation_idx ON public.patient_messages USING btree (hospital_id, patient_id, created_at)

CREATE INDEX patients_tenant_name_idx ON public.patients USING btree (hospital_id, last_name, first_name)

CREATE INDEX patients_tenant_phone_idx ON public.patients USING btree (hospital_id, phone)

CREATE INDEX payments_patient_history_idx ON public.payments USING btree (hospital_id, patient_id, created_at DESC)

CREATE INDEX queue_entries_order_idx ON public.queue_entries USING btree (hospital_id, department_id, status, checked_in_at)

CREATE INDEX referrals_destination_status_idx ON public.referrals USING btree (hospital_id, destination_department_id, status)

CREATE INDEX vitals_patient_timeline_idx ON public.vitals USING btree (hospital_id, patient_id, measured_at DESC)

alter table public.admissions enable row level security;

alter table public.appointments enable row level security;

alter table public.audit_logs enable row level security;

alter table public.bed_assignments enable row level security;

alter table public.beds enable row level security;

alter table public.cctv_access_logs enable row level security;

alter table public.cctv_cameras enable row level security;

alter table public.department_visits enable row level security;

alter table public.departments enable row level security;

alter table public.diagnoses enable row level security;

alter table public.dispensing_records enable row level security;

alter table public.encounters enable row level security;

alter table public.file_assets enable row level security;

alter table public.hospitals enable row level security;

alter table public.insurance_claims enable row level security;

alter table public.inventory_items enable row level security;

alter table public.inventory_movements enable row level security;

alter table public.invoice_items enable row level security;

alter table public.invoices enable row level security;

alter table public.lab_orders enable row level security;

alter table public.lab_results enable row level security;

alter table public.lab_samples enable row level security;

alter table public.medical_record_amendments enable row level security;

alter table public.medical_records enable row level security;

alter table public.notifications enable row level security;

alter table public.patient_contacts enable row level security;

alter table public.patient_identifiers enable row level security;

alter table public.patient_insurance enable row level security;

alter table public.patient_messages enable row level security;

alter table public.patients enable row level security;

alter table public.payments enable row level security;

alter table public.prescription_items enable row level security;

alter table public.prescriptions enable row level security;

alter table public.public_site_content enable row level security;

alter table public.queue_entries enable row level security;

alter table public.radiology_orders enable row level security;

alter table public.radiology_reports enable row level security;

alter table public.referrals enable row level security;

alter table public.staff_directory enable row level security;

alter table public.user_profiles enable row level security;

alter table public.vitals enable row level security;

alter table public.wards enable row level security;

create policy admissions_read on public.admissions as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]) OR (patient_visible AND app_private.owns_patient(patient_id)))));

create policy admissions_update on public.admissions as permissive for update to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy admissions_write on public.admissions as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy appointments_insert on public.appointments as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]) OR (app_private.has_role(ARRAY['patient'::text]) AND app_private.owns_patient(patient_id)))));

create policy appointments_read on public.appointments as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]) OR app_private.owns_patient(patient_id))));

create policy appointments_reception_update on public.appointments as permissive for update to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy audit_logs_admin_read on public.audit_logs as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text])));

create policy bed_assignments_manage on public.bed_assignments as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy bed_assignments_read on public.bed_assignments as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]) OR (patient_visible AND (EXISTS ( SELECT 1
   FROM admissions a
  WHERE ((a.id = bed_assignments.admission_id) AND app_private.owns_patient(a.patient_id))))))));

create policy beds_manage on public.beds as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy beds_read on public.beds as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy cctv_logs_admin_read on public.cctv_access_logs as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text])));

create policy cctv_cameras_admin_manage on public.cctv_cameras as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text])));

create policy cctv_cameras_admin_read on public.cctv_cameras as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text])));

create policy department_visits_read on public.department_visits as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]) OR (patient_visible AND app_private.owns_patient(patient_id)))));

create policy department_visits_update on public.department_visits as permissive for update to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy department_visits_write on public.department_visits as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy departments_manage on public.departments as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy departments_read on public.departments as permissive for select to authenticated using ((hospital_id = app_private.current_hospital_id()));

create policy diagnoses_patient_read on public.diagnoses as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND patient_visible AND app_private.owns_patient(patient_id)));

create policy diagnoses_staff_insert on public.diagnoses as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy diagnoses_staff_read on public.diagnoses as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy dispensing_staff_all on public.dispensing_records as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy encounters_insert on public.encounters as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy encounters_read on public.encounters as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy encounters_update on public.encounters as permissive for update to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy file_assets_insert on public.file_assets as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'staff'::text, 'receptionist'::text])));

create policy file_assets_patient_read on public.file_assets as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND patient_visible AND (patient_id IS NOT NULL) AND app_private.owns_patient(patient_id)));

create policy file_assets_staff_read on public.file_assets as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'staff'::text, 'receptionist'::text])));

create policy hospital_tenant_read on public.hospitals as permissive for select to authenticated using ((id = app_private.current_hospital_id()));

create policy insurance_claims_manage on public.insurance_claims as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy inventory_items_manage on public.inventory_items as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text])));

create policy inventory_items_read on public.inventory_items as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy inventory_movements_insert on public.inventory_movements as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'staff'::text])));

create policy inventory_movements_read on public.inventory_movements as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy invoice_items_manage on public.invoice_items as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy invoice_items_read on public.invoice_items as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]) OR (EXISTS ( SELECT 1
   FROM invoices i
  WHERE ((i.id = invoice_items.invoice_id) AND app_private.owns_patient(i.patient_id)))))));

create policy invoices_manage on public.invoices as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy invoices_read on public.invoices as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]) OR app_private.owns_patient(patient_id))));

create policy lab_orders_patient_read on public.lab_orders as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND patient_visible AND app_private.owns_patient(patient_id)));

create policy lab_orders_staff_insert on public.lab_orders as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy lab_orders_staff_read on public.lab_orders as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy lab_results_patient_read on public.lab_results as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND patient_visible AND (EXISTS ( SELECT 1
   FROM lab_orders lo
  WHERE ((lo.id = lab_results.lab_order_id) AND app_private.owns_patient(lo.patient_id))))));

create policy lab_results_staff_insert on public.lab_results as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy lab_results_staff_read on public.lab_results as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy lab_samples_staff_all on public.lab_samples as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy amendments_staff_insert on public.medical_record_amendments as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy amendments_staff_read on public.medical_record_amendments as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy records_patient_read on public.medical_records as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND patient_visible AND app_private.owns_patient(patient_id)));

create policy records_staff_insert on public.medical_records as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy records_staff_read on public.medical_records as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy notifications_insert on public.notifications as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy notifications_read on public.notifications as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND ((recipient_user_id = auth.uid()) OR ((recipient_patient_id IS NOT NULL) AND app_private.owns_patient(recipient_patient_id)) OR app_private.has_role(ARRAY['admin'::text]))));

create policy notifications_update on public.notifications as permissive for update to authenticated using (((hospital_id = app_private.current_hospital_id()) AND ((recipient_user_id = auth.uid()) OR app_private.has_role(ARRAY['admin'::text])))) with check (((hospital_id = app_private.current_hospital_id()) AND ((recipient_user_id = auth.uid()) OR app_private.has_role(ARRAY['admin'::text]))));

create policy patient_contacts_read on public.patient_contacts as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]) OR app_private.owns_patient(patient_id))));

create policy patient_contacts_write on public.patient_contacts as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy patient_identifiers_read on public.patient_identifiers as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy patient_identifiers_write on public.patient_identifiers as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy insurance_manage on public.patient_insurance as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy insurance_read on public.patient_insurance as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]) OR app_private.owns_patient(patient_id))));

create policy patient_messages_patient_insert on public.patient_messages as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND (sender_type = 'patient'::text) AND (sender_user_id = auth.uid()) AND app_private.owns_patient(patient_id)));

create policy patient_messages_read on public.patient_messages as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]) OR app_private.owns_patient(patient_id))));

create policy patient_messages_reception_insert on public.patient_messages as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND (sender_type = 'receptionist'::text) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy patient_messages_reception_update on public.patient_messages as permissive for update to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy patients_read on public.patients as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]) OR (auth_user_id = auth.uid()))));

create policy patients_reception_manage on public.patients as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy payments_insert on public.payments as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy payments_read on public.payments as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]) OR app_private.owns_patient(patient_id))));

create policy prescription_items_staff_insert on public.prescription_items as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy prescription_items_staff_read on public.prescription_items as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy prescriptions_patient_read on public.prescriptions as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND patient_visible AND app_private.owns_patient(patient_id)));

create policy prescriptions_staff_insert on public.prescriptions as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy prescriptions_staff_read on public.prescriptions as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy public_content_admin_manage on public.public_site_content as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text])));

create policy public_content_anon_read on public.public_site_content as permissive for select to anon using ((is_published = true));

create policy public_content_auth_read on public.public_site_content as permissive for select to authenticated using (((is_published = true) AND (hospital_id = app_private.current_hospital_id())));

create policy queues_read on public.queue_entries as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy queues_update on public.queue_entries as permissive for update to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy queues_write on public.queue_entries as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy radiology_orders_patient_read on public.radiology_orders as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND patient_visible AND app_private.owns_patient(patient_id)));

create policy radiology_orders_staff_insert on public.radiology_orders as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy radiology_orders_staff_read on public.radiology_orders as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy radiology_reports_patient_read on public.radiology_reports as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND patient_visible AND (EXISTS ( SELECT 1
   FROM radiology_orders ro
  WHERE ((ro.id = radiology_reports.radiology_order_id) AND app_private.owns_patient(ro.patient_id))))));

create policy radiology_reports_staff_insert on public.radiology_reports as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy radiology_reports_staff_read on public.radiology_reports as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy referrals_read on public.referrals as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND (app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]) OR (patient_visible AND app_private.owns_patient(patient_id)))));

create policy referrals_staff_insert on public.referrals as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy referrals_staff_update on public.referrals as permissive for update to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy staff_directory_manage on public.staff_directory as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy staff_directory_read on public.staff_directory as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

create policy profile_self_or_admin_read on public.user_profiles as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND ((auth_user_id = auth.uid()) OR app_private.has_role(ARRAY['admin'::text]))));

create policy vitals_patient_read on public.vitals as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND patient_visible AND app_private.owns_patient(patient_id)));

create policy vitals_staff_insert on public.vitals as permissive for insert to authenticated with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy vitals_staff_read on public.vitals as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['staff'::text])));

create policy wards_manage on public.wards as permissive for all to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text]))) with check (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text])));

create policy wards_read on public.wards as permissive for select to authenticated using (((hospital_id = app_private.current_hospital_id()) AND app_private.has_role(ARRAY['admin'::text, 'receptionist'::text, 'staff'::text])));

CREATE TRIGGER medical_amendments_append_only BEFORE DELETE OR UPDATE ON medical_record_amendments FOR EACH ROW EXECUTE FUNCTION app_private.reject_clinical_history_mutation();

CREATE TRIGGER medical_records_append_only BEFORE DELETE OR UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION app_private.reject_clinical_history_mutation();

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update on all tables in schema public to authenticated;
grant select on public.public_site_content to anon;
grant usage on all sequences in schema public to authenticated;
grant execute on all functions in schema app_private to authenticated;
