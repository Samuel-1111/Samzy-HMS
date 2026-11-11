export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admissions: {
        Row: {
          admission_reason: string
          admitted_at: string
          admitted_by: string | null
          discharge_instructions: string | null
          discharged_at: string | null
          encounter_id: string
          hospital_id: string
          id: string
          patient_id: string
          patient_visible: boolean
          status: string
        }
        Insert: {
          admission_reason: string
          admitted_at?: string
          admitted_by?: string | null
          discharge_instructions?: string | null
          discharged_at?: string | null
          encounter_id: string
          hospital_id: string
          id?: string
          patient_id: string
          patient_visible?: boolean
          status?: string
        }
        Update: {
          admission_reason?: string
          admitted_at?: string
          admitted_by?: string | null
          discharge_instructions?: string | null
          discharged_at?: string | null
          encounter_id?: string
          hospital_id?: string
          id?: string
          patient_id?: string
          patient_visible?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "admissions_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          created_by: string | null
          department_id: string | null
          hospital_id: string
          id: string
          patient_id: string
          reason: string | null
          receptionist_notes: string | null
          requested_at: string
          reviewed_by: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          hospital_id: string
          id?: string
          patient_id: string
          reason?: string | null
          receptionist_notes?: string | null
          requested_at?: string
          reviewed_by?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          hospital_id?: string
          id?: string
          patient_id?: string
          reason?: string | null
          receptionist_notes?: string | null
          requested_at?: string
          reviewed_by?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          hospital_id: string
          id: string
          metadata: Json
          occurred_at: string
          outcome: string
          request_id: string | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          hospital_id: string
          id?: string
          metadata?: Json
          occurred_at?: string
          outcome?: string
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          hospital_id?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          outcome?: string
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      bed_assignments: {
        Row: {
          admission_id: string
          assigned_at: string
          bed_id: string
          hospital_id: string
          id: string
          patient_visible: boolean
          released_at: string | null
        }
        Insert: {
          admission_id: string
          assigned_at?: string
          bed_id: string
          hospital_id: string
          id?: string
          patient_visible?: boolean
          released_at?: string | null
        }
        Update: {
          admission_id?: string
          assigned_at?: string
          bed_id?: string
          hospital_id?: string
          id?: string
          patient_visible?: boolean
          released_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bed_assignments_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_assignments_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_assignments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          created_at: string
          hospital_id: string
          id: string
          status: string
          ward_id: string
        }
        Insert: {
          bed_number: string
          created_at?: string
          hospital_id: string
          id?: string
          status?: string
          ward_id: string
        }
        Update: {
          bed_number?: string
          created_at?: string
          hospital_id?: string
          id?: string
          status?: string
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beds_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      cctv_access_logs: {
        Row: {
          accessed_by: string | null
          action: string
          camera_id: string | null
          hospital_id: string
          id: string
          occurred_at: string
          purpose: string | null
        }
        Insert: {
          accessed_by?: string | null
          action: string
          camera_id?: string | null
          hospital_id: string
          id?: string
          occurred_at?: string
          purpose?: string | null
        }
        Update: {
          accessed_by?: string | null
          action?: string
          camera_id?: string | null
          hospital_id?: string
          id?: string
          occurred_at?: string
          purpose?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cctv_access_logs_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: false
            referencedRelation: "cctv_cameras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cctv_access_logs_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      cctv_cameras: {
        Row: {
          camera_name: string
          created_at: string
          external_camera_id: string | null
          hospital_id: string
          id: string
          integration_type: string | null
          is_enabled: boolean
          location_label: string
        }
        Insert: {
          camera_name: string
          created_at?: string
          external_camera_id?: string | null
          hospital_id: string
          id?: string
          integration_type?: string | null
          is_enabled?: boolean
          location_label: string
        }
        Update: {
          camera_name?: string
          created_at?: string
          external_camera_id?: string | null
          hospital_id?: string
          id?: string
          integration_type?: string | null
          is_enabled?: boolean
          location_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "cctv_cameras_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      department_visits: {
        Row: {
          assigned_staff_id: string | null
          checked_in_at: string
          completed_at: string | null
          created_at: string
          department_id: string
          department_name_snapshot: string | null
          encounter_id: string
          hospital_id: string
          id: string
          patient_id: string
          patient_visible: boolean
          priority: string
          started_at: string | null
          status: string
        }
        Insert: {
          assigned_staff_id?: string | null
          checked_in_at?: string
          completed_at?: string | null
          created_at?: string
          department_id: string
          department_name_snapshot?: string | null
          encounter_id: string
          hospital_id: string
          id?: string
          patient_id: string
          patient_visible?: boolean
          priority?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          assigned_staff_id?: string | null
          checked_in_at?: string
          completed_at?: string | null
          created_at?: string
          department_id?: string
          department_name_snapshot?: string | null
          encounter_id?: string
          hospital_id?: string
          id?: string
          patient_id?: string
          patient_visible?: boolean
          priority?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_visits_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_visits_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_visits_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_visits_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          hospital_id: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          hospital_id: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          hospital_id?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          code_system: string | null
          created_at: string
          description: string
          diagnosis_code: string | null
          diagnosis_type: string
          encounter_id: string
          hospital_id: string
          id: string
          medical_record_id: string | null
          patient_id: string
          patient_visible: boolean
          recorded_by: string | null
        }
        Insert: {
          code_system?: string | null
          created_at?: string
          description: string
          diagnosis_code?: string | null
          diagnosis_type?: string
          encounter_id: string
          hospital_id: string
          id?: string
          medical_record_id?: string | null
          patient_id: string
          patient_visible?: boolean
          recorded_by?: string | null
        }
        Update: {
          code_system?: string | null
          created_at?: string
          description?: string
          diagnosis_code?: string | null
          diagnosis_type?: string
          encounter_id?: string
          hospital_id?: string
          id?: string
          medical_record_id?: string | null
          patient_id?: string
          patient_visible?: boolean
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      dispensing_records: {
        Row: {
          batch_number: string | null
          dispensed_at: string
          dispensed_by: string | null
          hospital_id: string
          id: string
          notes: string | null
          prescription_item_id: string
          quantity_dispensed: number
        }
        Insert: {
          batch_number?: string | null
          dispensed_at?: string
          dispensed_by?: string | null
          hospital_id: string
          id?: string
          notes?: string | null
          prescription_item_id: string
          quantity_dispensed: number
        }
        Update: {
          batch_number?: string | null
          dispensed_at?: string
          dispensed_by?: string | null
          hospital_id?: string
          id?: string
          notes?: string | null
          prescription_item_id?: string
          quantity_dispensed?: number
        }
        Relationships: [
          {
            foreignKeyName: "dispensing_records_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispensing_records_prescription_item_id_fkey"
            columns: ["prescription_item_id"]
            isOneToOne: false
            referencedRelation: "prescription_items"
            referencedColumns: ["id"]
          },
        ]
      }
      encounters: {
        Row: {
          appointment_id: string | null
          closed_at: string | null
          created_at: string
          created_by: string | null
          encounter_number: string
          encounter_type: string
          hospital_id: string
          id: string
          opened_at: string
          patient_id: string
          status: string
        }
        Insert: {
          appointment_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          encounter_number: string
          encounter_type?: string
          hospital_id: string
          id?: string
          opened_at?: string
          patient_id: string
          status?: string
        }
        Update: {
          appointment_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          encounter_number?: string
          encounter_type?: string
          hospital_id?: string
          id?: string
          opened_at?: string
          patient_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounters_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      file_assets: {
        Row: {
          bucket_id: string
          created_at: string
          file_category: string
          hospital_id: string
          id: string
          object_path: string
          patient_id: string | null
          patient_visible: boolean
          uploaded_by: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string
          file_category: string
          hospital_id: string
          id?: string
          object_path: string
          patient_id?: string | null
          patient_visible?: boolean
          uploaded_by?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string
          file_category?: string
          hospital_id?: string
          id?: string
          object_path?: string
          patient_id?: string | null
          patient_visible?: boolean
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_assets_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_assets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: Json
          created_at: string
          currency_code: string
          display_name: string
          email: string | null
          id: string
          legal_name: string
          phone: string | null
          settings: Json
          slug: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: Json
          created_at?: string
          currency_code?: string
          display_name: string
          email?: string | null
          id?: string
          legal_name: string
          phone?: string | null
          settings?: Json
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: Json
          created_at?: string
          currency_code?: string
          display_name?: string
          email?: string | null
          id?: string
          legal_name?: string
          phone?: string | null
          settings?: Json
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          amount_approved: number | null
          amount_claimed: number
          claim_number: string | null
          created_at: string
          hospital_id: string
          id: string
          insurance_id: string
          invoice_id: string | null
          patient_id: string
          resolved_at: string | null
          status: string
          submitted_at: string | null
        }
        Insert: {
          amount_approved?: number | null
          amount_claimed: number
          claim_number?: string | null
          created_at?: string
          hospital_id: string
          id?: string
          insurance_id: string
          invoice_id?: string | null
          patient_id: string
          resolved_at?: string | null
          status?: string
          submitted_at?: string | null
        }
        Update: {
          amount_approved?: number | null
          amount_claimed?: number
          claim_number?: string | null
          created_at?: string
          hospital_id?: string
          id?: string
          insurance_id?: string
          invoice_id?: string | null
          patient_id?: string
          resolved_at?: string | null
          status?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_insurance_id_fkey"
            columns: ["insurance_id"]
            isOneToOne: false
            referencedRelation: "patient_insurance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          hospital_id: string
          id: string
          is_active: boolean
          item_code: string | null
          item_name: string
          reorder_level: number
          unit: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          hospital_id: string
          id?: string
          is_active?: boolean
          item_code?: string | null
          item_name: string
          reorder_level?: number
          unit: string
        }
        Update: {
          category?: string | null
          created_at?: string
          hospital_id?: string
          id?: string
          is_active?: boolean
          item_code?: string | null
          item_name?: string
          reorder_level?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          item_id: string
          movement_type: string
          notes: string | null
          quantity: number
          recorded_by: string | null
          reference: string | null
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          item_id: string
          movement_type: string
          notes?: string | null
          quantity: number
          recorded_by?: string | null
          reference?: string | null
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          item_id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          recorded_by?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          hospital_id: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          hospital_id: string
          id?: string
          invoice_id: string
          line_total: number
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          hospital_id?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_by: string | null
          currency_code: string
          discount: number
          due_at: string | null
          encounter_id: string | null
          hospital_id: string
          id: string
          invoice_number: string
          issued_at: string
          patient_id: string
          status: string
          subtotal: number
          total: number
        }
        Insert: {
          created_by?: string | null
          currency_code?: string
          discount?: number
          due_at?: string | null
          encounter_id?: string | null
          hospital_id: string
          id?: string
          invoice_number: string
          issued_at?: string
          patient_id: string
          status?: string
          subtotal?: number
          total?: number
        }
        Update: {
          created_by?: string | null
          currency_code?: string
          discount?: number
          due_at?: string | null
          encounter_id?: string | null
          hospital_id?: string
          id?: string
          invoice_number?: string
          issued_at?: string
          patient_id?: string
          status?: string
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          clinical_indication: string | null
          encounter_id: string
          hospital_id: string
          id: string
          ordered_at: string
          ordered_by: string | null
          patient_id: string
          patient_visible: boolean
          priority: string
          status: string
          test_name: string
        }
        Insert: {
          clinical_indication?: string | null
          encounter_id: string
          hospital_id: string
          id?: string
          ordered_at?: string
          ordered_by?: string | null
          patient_id: string
          patient_visible?: boolean
          priority?: string
          status?: string
          test_name: string
        }
        Update: {
          clinical_indication?: string | null
          encounter_id?: string
          hospital_id?: string
          id?: string
          ordered_at?: string
          ordered_by?: string | null
          patient_id?: string
          patient_visible?: boolean
          priority?: string
          status?: string
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          interpretation: string | null
          lab_order_id: string
          patient_visible: boolean
          reference_ranges: Json
          result: Json
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          interpretation?: string | null
          lab_order_id: string
          patient_visible?: boolean
          reference_ranges?: Json
          result: Json
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          interpretation?: string | null
          lab_order_id?: string
          patient_visible?: boolean
          reference_ranges?: Json
          result?: Json
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_samples: {
        Row: {
          collected_at: string | null
          collected_by: string | null
          created_at: string
          hospital_id: string
          id: string
          lab_order_id: string
          sample_identifier: string | null
          sample_type: string
          status: string
        }
        Insert: {
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          hospital_id: string
          id?: string
          lab_order_id: string
          sample_identifier?: string | null
          sample_type: string
          status?: string
        }
        Update: {
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          hospital_id?: string
          id?: string
          lab_order_id?: string
          sample_identifier?: string | null
          sample_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_samples_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_samples_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_record_amendments: {
        Row: {
          amended_by: string | null
          amendment: Json
          author_name: string
          created_at: string
          hospital_id: string
          id: string
          medical_record_id: string
          reason: string
        }
        Insert: {
          amended_by?: string | null
          amendment: Json
          author_name: string
          created_at?: string
          hospital_id: string
          id?: string
          medical_record_id: string
          reason: string
        }
        Update: {
          amended_by?: string | null
          amendment?: Json
          author_name?: string
          created_at?: string
          hospital_id?: string
          id?: string
          medical_record_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_record_amendments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_record_amendments_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          author_name: string
          author_role: string
          author_user_id: string | null
          content: Json
          created_at: string
          department_id: string | null
          department_name_snapshot: string | null
          department_visit_id: string | null
          encounter_id: string
          hospital_id: string
          id: string
          patient_id: string
          patient_visible: boolean
          record_type: string
          recorded_at: string
          title: string
        }
        Insert: {
          author_name: string
          author_role: string
          author_user_id?: string | null
          content: Json
          created_at?: string
          department_id?: string | null
          department_name_snapshot?: string | null
          department_visit_id?: string | null
          encounter_id: string
          hospital_id: string
          id?: string
          patient_id: string
          patient_visible?: boolean
          record_type: string
          recorded_at?: string
          title: string
        }
        Update: {
          author_name?: string
          author_role?: string
          author_user_id?: string | null
          content?: Json
          created_at?: string
          department_id?: string | null
          department_name_snapshot?: string | null
          department_visit_id?: string | null
          encounter_id?: string
          hospital_id?: string
          id?: string
          patient_id?: string
          patient_visible?: boolean
          record_type?: string
          recorded_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_department_visit_id_fkey"
            columns: ["department_visit_id"]
            isOneToOne: false
            referencedRelation: "department_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: string
          created_at: string
          hospital_id: string
          id: string
          read_at: string | null
          recipient_patient_id: string | null
          recipient_user_id: string | null
          sent_at: string | null
          status: string
          title: string
        }
        Insert: {
          body: string
          channel?: string
          created_at?: string
          hospital_id: string
          id?: string
          read_at?: string | null
          recipient_patient_id?: string | null
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string
          title: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          hospital_id?: string
          id?: string
          read_at?: string | null
          recipient_patient_id?: string | null
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_patient_id_fkey"
            columns: ["recipient_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_contacts: {
        Row: {
          contact_type: string
          created_at: string
          hospital_id: string
          id: string
          is_primary: boolean
          label: string | null
          patient_id: string
          value: Json
        }
        Insert: {
          contact_type: string
          created_at?: string
          hospital_id: string
          id?: string
          is_primary?: boolean
          label?: string | null
          patient_id: string
          value: Json
        }
        Update: {
          contact_type?: string
          created_at?: string
          hospital_id?: string
          id?: string
          is_primary?: boolean
          label?: string | null
          patient_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "patient_contacts_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_contacts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_guardians: {
        Row: {
          can_book_appointments: boolean
          can_view_records: boolean
          created_at: string
          created_by: string | null
          guardian_auth_user_id: string
          hospital_id: string
          id: string
          patient_id: string
          relationship: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          can_book_appointments?: boolean
          can_view_records?: boolean
          created_at?: string
          created_by?: string | null
          guardian_auth_user_id: string
          hospital_id: string
          id?: string
          patient_id: string
          relationship: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          can_book_appointments?: boolean
          can_view_records?: boolean
          created_at?: string
          created_by?: string | null
          guardian_auth_user_id?: string
          hospital_id?: string
          id?: string
          patient_id?: string
          relationship?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_guardians_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_guardians_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_identifiers: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          identifier_type: string
          identifier_value: string
          issuing_authority: string | null
          patient_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          identifier_type: string
          identifier_value: string
          issuing_authority?: string | null
          patient_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          identifier_type?: string
          identifier_value?: string
          issuing_authority?: string | null
          patient_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_identifiers_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_identifiers_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_insurance: {
        Row: {
          copay_details: Json
          coverage_details: Json
          created_at: string
          enrollee_number: string | null
          exclusions: Json
          hospital_id: string
          id: string
          member_type: string | null
          patient_id: string
          policy_number: string | null
          provider_name: string
          scheme_type: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          verification_status: string
        }
        Insert: {
          copay_details?: Json
          coverage_details?: Json
          created_at?: string
          enrollee_number?: string | null
          exclusions?: Json
          hospital_id: string
          id?: string
          member_type?: string | null
          patient_id: string
          policy_number?: string | null
          provider_name: string
          scheme_type: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          verification_status?: string
        }
        Update: {
          copay_details?: Json
          coverage_details?: Json
          created_at?: string
          enrollee_number?: string | null
          exclusions?: Json
          hospital_id?: string
          id?: string
          member_type?: string | null
          patient_id?: string
          policy_number?: string | null
          provider_name?: string
          scheme_type?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_insurance_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insurance_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_messages: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          message: string
          patient_id: string
          read_at: string | null
          sender_type: string
          sender_user_id: string | null
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          message: string
          patient_id: string
          read_at?: string | null
          sender_type: string
          sender_user_id?: string | null
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          message?: string
          patient_id?: string
          read_at?: string | null
          sender_type?: string
          sender_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_messages_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: Json
          auth_user_id: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact: Json
          first_name: string
          hospital_id: string
          id: string
          last_name: string
          middle_name: string | null
          next_of_kin: Json
          patient_category: string
          patient_number: string
          phone: string | null
          photo_path: string | null
          record_status: string
          sex: string | null
          updated_at: string
        }
        Insert: {
          address?: Json
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: Json
          first_name: string
          hospital_id: string
          id?: string
          last_name: string
          middle_name?: string | null
          next_of_kin?: Json
          patient_category?: string
          patient_number: string
          phone?: string | null
          photo_path?: string | null
          record_status?: string
          sex?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: Json
          first_name?: string
          hospital_id?: string
          id?: string
          last_name?: string
          middle_name?: string | null
          next_of_kin?: Json
          patient_category?: string
          patient_number?: string
          phone?: string | null
          photo_path?: string | null
          record_status?: string
          sex?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency_code: string
          hospital_id: string
          id: string
          invoice_id: string
          patient_id: string
          payment_method: string
          provider: string | null
          provider_reference: string | null
          received_at: string | null
          recorded_by: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code?: string
          hospital_id: string
          id?: string
          invoice_id: string
          patient_id: string
          payment_method: string
          provider?: string | null
          provider_reference?: string | null
          received_at?: string | null
          recorded_by?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string
          hospital_id?: string
          id?: string
          invoice_id?: string
          patient_id?: string
          payment_method?: string
          provider?: string | null
          provider_reference?: string | null
          received_at?: string | null
          recorded_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_items: {
        Row: {
          created_at: string
          dosage: string
          duration: string | null
          frequency: string
          hospital_id: string
          id: string
          instructions: string | null
          medicine_name: string
          prescription_id: string
          quantity: number | null
          route: string | null
          strength: string | null
        }
        Insert: {
          created_at?: string
          dosage: string
          duration?: string | null
          frequency: string
          hospital_id: string
          id?: string
          instructions?: string | null
          medicine_name: string
          prescription_id: string
          quantity?: number | null
          route?: string | null
          strength?: string | null
        }
        Update: {
          created_at?: string
          dosage?: string
          duration?: string | null
          frequency?: string
          hospital_id?: string
          id?: string
          instructions?: string | null
          medicine_name?: string
          prescription_id?: string
          quantity?: number | null
          route?: string | null
          strength?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          encounter_id: string
          hospital_id: string
          id: string
          instructions: string | null
          patient_id: string
          patient_visible: boolean
          prescribed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          encounter_id: string
          hospital_id: string
          id?: string
          instructions?: string | null
          patient_id: string
          patient_visible?: boolean
          prescribed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          encounter_id?: string
          hospital_id?: string
          id?: string
          instructions?: string | null
          patient_id?: string
          patient_visible?: boolean
          prescribed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      public_site_content: {
        Row: {
          content: Json
          content_key: string
          hospital_id: string
          id: string
          is_published: boolean
          published_at: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: Json
          content_key: string
          hospital_id: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          content_key?: string
          hospital_id?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_site_content_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_entries: {
        Row: {
          called_at: string | null
          checked_in_at: string
          completed_at: string | null
          created_at: string
          department_id: string
          department_name_snapshot: string | null
          department_visit_id: string
          hospital_id: string
          id: string
          patient_id: string
          priority: string
          queue_number: string | null
          status: string
        }
        Insert: {
          called_at?: string | null
          checked_in_at?: string
          completed_at?: string | null
          created_at?: string
          department_id: string
          department_name_snapshot?: string | null
          department_visit_id: string
          hospital_id: string
          id?: string
          patient_id: string
          priority?: string
          queue_number?: string | null
          status?: string
        }
        Update: {
          called_at?: string | null
          checked_in_at?: string
          completed_at?: string | null
          created_at?: string
          department_id?: string
          department_name_snapshot?: string | null
          department_visit_id?: string
          hospital_id?: string
          id?: string
          patient_id?: string
          priority?: string
          queue_number?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_entries_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_entries_department_visit_id_fkey"
            columns: ["department_visit_id"]
            isOneToOne: false
            referencedRelation: "department_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_entries_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      radiology_orders: {
        Row: {
          clinical_indication: string | null
          created_at: string
          encounter_id: string
          examination: string
          hospital_id: string
          id: string
          ordered_by: string | null
          patient_id: string
          patient_visible: boolean
          status: string
        }
        Insert: {
          clinical_indication?: string | null
          created_at?: string
          encounter_id: string
          examination: string
          hospital_id: string
          id?: string
          ordered_by?: string | null
          patient_id: string
          patient_visible?: boolean
          status?: string
        }
        Update: {
          clinical_indication?: string | null
          created_at?: string
          encounter_id?: string
          examination?: string
          hospital_id?: string
          id?: string
          ordered_by?: string | null
          patient_id?: string
          patient_visible?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "radiology_orders_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radiology_orders_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radiology_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      radiology_reports: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          patient_visible: boolean
          radiology_order_id: string
          report: string
          reported_by: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          patient_visible?: boolean
          radiology_order_id: string
          report: string
          reported_by?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          patient_visible?: boolean
          radiology_order_id?: string
          report?: string
          reported_by?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "radiology_reports_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radiology_reports_radiology_order_id_fkey"
            columns: ["radiology_order_id"]
            isOneToOne: false
            referencedRelation: "radiology_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_events: {
        Row: {
          actor_user_id: string | null
          author_name: string | null
          created_at: string
          details: string | null
          event_type: string
          hospital_id: string
          id: string
          referral_id: string
        }
        Insert: {
          actor_user_id?: string | null
          author_name?: string | null
          created_at?: string
          details?: string | null
          event_type: string
          hospital_id: string
          id?: string
          referral_id: string
        }
        Update: {
          actor_user_id?: string | null
          author_name?: string | null
          created_at?: string
          details?: string | null
          event_type?: string
          hospital_id?: string
          id?: string
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          destination_department_id: string
          destination_department_name_snapshot: string | null
          encounter_id: string
          hospital_id: string
          id: string
          instructions: string | null
          patient_id: string
          patient_visible: boolean
          priority: string
          reason: string
          received_at: string | null
          referred_by: string | null
          source_department_id: string | null
          source_department_name_snapshot: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          destination_department_id: string
          destination_department_name_snapshot?: string | null
          encounter_id: string
          hospital_id: string
          id?: string
          instructions?: string | null
          patient_id: string
          patient_visible?: boolean
          priority?: string
          reason: string
          received_at?: string | null
          referred_by?: string | null
          source_department_id?: string | null
          source_department_name_snapshot?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          destination_department_id?: string
          destination_department_name_snapshot?: string | null
          encounter_id?: string
          hospital_id?: string
          id?: string
          instructions?: string | null
          patient_id?: string
          patient_visible?: boolean
          priority?: string
          reason?: string
          received_at?: string | null
          referred_by?: string | null
          source_department_id?: string | null
          source_department_name_snapshot?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_destination_department_id_fkey"
            columns: ["destination_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_source_department_id_fkey"
            columns: ["source_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_directory: {
        Row: {
          auth_user_id: string | null
          created_at: string
          department_id: string | null
          email: string | null
          full_name: string
          hospital_id: string
          id: string
          is_active: boolean
          job_title: string | null
          phone: string | null
          staff_number: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name: string
          hospital_id: string
          id?: string
          is_active?: boolean
          job_title?: string | null
          phone?: string | null
          staff_number?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name?: string
          hospital_id?: string
          id?: string
          is_active?: boolean
          job_title?: string | null
          phone?: string | null
          staff_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_directory_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_directory_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_user_id: string
          created_at: string
          display_name: string
          email: string | null
          hospital_id: string
          id: string
          is_active: boolean
          login_username: string | null
          must_change_password: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          display_name: string
          email?: string | null
          hospital_id: string
          id?: string
          is_active?: boolean
          login_username?: string | null
          must_change_password?: boolean
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          display_name?: string
          email?: string | null
          hospital_id?: string
          id?: string
          is_active?: boolean
          login_username?: string | null
          must_change_password?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      vitals: {
        Row: {
          allergies: Json
          author_name: string
          bmi: number | null
          consciousness: string | null
          created_at: string
          department_id: string | null
          department_name_snapshot: string | null
          department_visit_id: string | null
          diastolic_bp: number | null
          encounter_id: string
          glucose_unit: string | null
          glucose_value: number | null
          height_cm: number | null
          hospital_id: string
          id: string
          measured_at: string
          measured_by: string | null
          notes: string | null
          pain_score: number | null
          patient_id: string
          patient_visible: boolean
          pulse_bpm: number | null
          respiratory_rate: number | null
          spo2_percent: number | null
          systolic_bp: number | null
          temperature_c: number | null
          weight_kg: number | null
        }
        Insert: {
          allergies?: Json
          author_name: string
          bmi?: number | null
          consciousness?: string | null
          created_at?: string
          department_id?: string | null
          department_name_snapshot?: string | null
          department_visit_id?: string | null
          diastolic_bp?: number | null
          encounter_id: string
          glucose_unit?: string | null
          glucose_value?: number | null
          height_cm?: number | null
          hospital_id: string
          id?: string
          measured_at?: string
          measured_by?: string | null
          notes?: string | null
          pain_score?: number | null
          patient_id: string
          patient_visible?: boolean
          pulse_bpm?: number | null
          respiratory_rate?: number | null
          spo2_percent?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Update: {
          allergies?: Json
          author_name?: string
          bmi?: number | null
          consciousness?: string | null
          created_at?: string
          department_id?: string | null
          department_name_snapshot?: string | null
          department_visit_id?: string | null
          diastolic_bp?: number | null
          encounter_id?: string
          glucose_unit?: string | null
          glucose_value?: number | null
          height_cm?: number | null
          hospital_id?: string
          id?: string
          measured_at?: string
          measured_by?: string | null
          notes?: string | null
          pain_score?: number | null
          patient_id?: string
          patient_visible?: boolean
          pulse_bpm?: number | null
          respiratory_rate?: number | null
          spo2_percent?: number | null
          systolic_bp?: number | null
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_department_visit_id_fkey"
            columns: ["department_visit_id"]
            isOneToOne: false
            referencedRelation: "department_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      wards: {
        Row: {
          created_at: string
          gender_policy: string | null
          hospital_id: string
          id: string
          is_active: boolean
          name: string
          ward_type: string | null
        }
        Insert: {
          created_at?: string
          gender_policy?: string | null
          hospital_id: string
          id?: string
          is_active?: boolean
          name: string
          ward_type?: string | null
        }
        Update: {
          created_at?: string
          gender_policy?: string | null
          hospital_id?: string
          id?: string
          is_active?: boolean
          name?: string
          ward_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wards_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
