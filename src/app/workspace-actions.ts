"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPortalSession } from "@/lib/auth/admin-session";

type Role="admin"|"receptionist"|"staff"|"patient";
type FormValues=Record<string,string|boolean|undefined>;
async function context(allowed:Role[]){
 const session=await getPortalSession(allowed);
 if(!session) throw new Error("Your portal session has expired or your account is inactive. Sign in again.");
 if(session.role==="patient") throw new Error("Patient workspace access remains locked until individual patient workflows are enabled.");
 const hospitalId=session.hospitalId;
 const supabase=createAdminClient();
 const {data:hospital,error:hospitalError}=await supabase.from("hospitals").select("id,status").eq("id",hospitalId).maybeSingle();
 if(hospitalError) throw new Error("Unable to verify the hospital workspace: "+hospitalError.message);
 if(!hospital||hospital.status!=="active") throw new Error("Your hospital workspace is inactive or unavailable. No records were changed.");
 return {supabase,actorUserId:session.userId,role:session.role,hospitalId};
}
export async function loadWorkspaceRecords(moduleId:string){
 const {supabase,hospitalId,role}=await context(["admin","receptionist","staff"]);
 const limit=75;
 switch(moduleId){
  case "departments": {const {data,error}=await supabase.from("departments").select("id,name,code,description,is_active,created_at").eq("hospital_id",hospitalId).order("name").limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "staff": {if(role!=="admin"&&role!=="receptionist")throw new Error("Not authorised.");const {data,error}=await supabase.from("staff_directory").select("id,full_name,staff_number,job_title,phone,email,is_active,department_id").eq("hospital_id",hospitalId).order("full_name").limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "patients": {const {data,error}=await supabase.from("patients").select("id,patient_number,first_name,middle_name,last_name,phone,email,patient_category,record_status,date_of_birth,sex,created_at").eq("hospital_id",hospitalId).order("created_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "appointments": {const q=supabase.from("appointments").select("id,patient_id,department_id,requested_at,scheduled_at,reason,status,receptionist_notes").eq("hospital_id",hospitalId).order("requested_at",{ascending:false}).limit(limit);const {data,error}=await q;if(error)throw new Error(error.message);return data??[];}
  case "messages": {if(role!=="admin"&&role!=="receptionist")throw new Error("Not authorised.");const {data,error}=await supabase.from("patient_messages").select("id,patient_id,sender_type,message,created_at,read_at").eq("hospital_id",hospitalId).order("created_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "wards": {const {data,error}=await supabase.from("wards").select("id,name,ward_type,gender_policy,is_active").eq("hospital_id",hospitalId).order("name").limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "queues": {const {data,error}=await supabase.from("department_visits").select("id,patient_id,encounter_id,department_id,status,priority,checked_in_at,started_at,completed_at,department_name_snapshot").eq("hospital_id",hospitalId).order("checked_in_at").limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "records": {const {data,error}=await supabase.from("medical_records").select("id,patient_id,encounter_id,department_id,author_name,author_role,title,record_type,patient_visible,recorded_at").eq("hospital_id",hospitalId).order("recorded_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "referrals": {const {data,error}=await supabase.from("referrals").select("id,patient_id,encounter_id,source_department_id,destination_department_id,reason,priority,status,created_at").eq("hospital_id",hospitalId).order("created_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "admissions": {const {data,error}=await supabase.from("admissions").select("id,patient_id,encounter_id,admission_reason,status,admitted_at,discharged_at").eq("hospital_id",hospitalId).order("admitted_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "notifications": {const {data,error}=await supabase.from("notifications").select("id,title,body,channel,status,created_at,read_at").eq("hospital_id",hospitalId).order("created_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "inventory": {const {data,error}=await supabase.from("inventory_items").select("id,item_name,item_code,category,unit,reorder_level,is_active").eq("hospital_id",hospitalId).order("item_name").limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "billing": {const {data,error}=await supabase.from("invoices").select("id,invoice_number,patient_id,subtotal,discount,total,currency_code,status,issued_at,due_at").eq("hospital_id",hospitalId).order("issued_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "audit": {if(role!=="admin")throw new Error("Only Admin can inspect audit events.");const {data,error}=await supabase.from("audit_logs").select("id,action,resource_type,resource_id,outcome,occurred_at,metadata").eq("hospital_id",hospitalId).order("occurred_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  default:return [];
 }
}
export async function createWorkspaceRecord(moduleId:string,values:FormValues){
 const {supabase,actorUserId,hospitalId,role}=await context(["admin","receptionist","staff"]);
 const val=(key:string)=>String(values[key]??"").trim();
 const optional=(key:string)=>val(key)||null;
 if(moduleId==="departments"){
  if(role!=="admin"&&role!=="receptionist")throw new Error("Only Admin or Reception can manage departments.");
  if(!val("name"))throw new Error("Department name is required.");
  const {error}=await supabase.from("departments").insert({hospital_id:hospitalId,name:val("name"),code:optional("code"),description:optional("description"),is_active:true});
  if(error)throw new Error(error.message);
 }else if(moduleId==="staff"){
  if(role!=="admin"&&role!=="receptionist")throw new Error("Not authorised to manage the staff directory.");
  if(!val("full_name"))throw new Error("Staff full name is required.");
  const {error}=await supabase.from("staff_directory").insert({hospital_id:hospitalId,full_name:val("full_name"),staff_number:optional("staff_number"),job_title:optional("job_title"),phone:optional("phone"),email:optional("email"),department_id:optional("department_id")});
  if(error)throw new Error(error.message);
 }else if(moduleId==="patients"){
  if(role!=="admin"&&role!=="receptionist")throw new Error("Only Reception or Admin can register patients.");
  if(!val("first_name")||!val("last_name"))throw new Error("Patient first and last name are required.");
  const {error}=await supabase.from("patients").insert({hospital_id:hospitalId,patient_number:"",first_name:val("first_name"),middle_name:optional("middle_name"),last_name:val("last_name"),date_of_birth:optional("date_of_birth"),sex:(val("sex")||"not_recorded") as "female"|"male"|"intersex"|"unknown"|"not_recorded",phone:optional("phone"),email:optional("email"),patient_category:(val("patient_category")||"private") as "nhia"|"hmo"|"private"|"self_pay",record_status:"active",created_by:actorUserId});
  if(error)throw new Error(error.message);
 }else if(moduleId==="appointments"){
  if(role!=="admin"&&role!=="receptionist")throw new Error("Only Reception or Admin can schedule appointments.");
  if(!val("patient_id")||!val("reason"))throw new Error("Patient ID and appointment reason are required.");
  const {data:patient,error:patientError}=await supabase.from("patients").select("id").eq("hospital_id",hospitalId).eq("id",val("patient_id")).maybeSingle();
  if(patientError||!patient)throw new Error("Select a valid patient from this hospital.");
  if(val("department_id")){const {data:department}=await supabase.from("departments").select("id").eq("hospital_id",hospitalId).eq("id",val("department_id")).maybeSingle();if(!department)throw new Error("Select a valid department from this hospital.");}
  const {error}=await supabase.from("appointments").insert({hospital_id:hospitalId,patient_id:val("patient_id"),department_id:optional("department_id"),scheduled_at:optional("scheduled_at"),reason:val("reason"),status:"requested",created_by:actorUserId});
  if(error)throw new Error(error.message);
 }else if(moduleId==="records"){
  if(role!=="staff")throw new Error("Clinical record entry is restricted to the Staff Portal.");
  if(!val("patient_id")||!val("encounter_id")||!val("author_name")||!val("title")||!val("content"))throw new Error("Patient, encounter, author, title and note content are required.");
  const {data:patient}=await supabase.from("patients").select("id").eq("hospital_id",hospitalId).eq("id",val("patient_id")).maybeSingle();
  const {data:encounter}=await supabase.from("encounters").select("id").eq("hospital_id",hospitalId).eq("id",val("encounter_id")).eq("patient_id",val("patient_id")).maybeSingle();
  if(!patient||!encounter)throw new Error("Select a valid patient and one of that patient’s encounters.");
  if(val("department_id")){const {data:department}=await supabase.from("departments").select("id").eq("hospital_id",hospitalId).eq("id",val("department_id")).maybeSingle();if(!department)throw new Error("Select a valid department from this hospital.");}
  const {error}=await supabase.from("medical_records").insert({hospital_id:hospitalId,patient_id:val("patient_id"),encounter_id:val("encounter_id"),department_id:optional("department_id"),author_user_id:actorUserId,author_name:val("author_name"),author_role:"staff",title:val("title"),record_type:(val("record_type")||"clinical_note") as "consultation"|"clinical_note"|"nursing_note"|"assessment"|"procedure"|"discharge_summary"|"other",content:{note:val("content")},patient_visible:false});
  if(error)throw new Error(error.message);
 }else if(moduleId==="messages"){
  if(role!=="admin"&&role!=="receptionist")throw new Error("Only Reception can manage patient messages.");
  if(!val("patient_id")||!val("message"))throw new Error("Patient ID and message are required.");
  const sender="receptionist";
  const {data:patient}=await supabase.from("patients").select("id").eq("hospital_id",hospitalId).eq("id",val("patient_id")).maybeSingle();if(!patient)throw new Error("Select a valid patient from this hospital.");
  const {error}=await supabase.from("patient_messages").insert({hospital_id:hospitalId,patient_id:val("patient_id"),sender_type:sender,sender_user_id:actorUserId,message:val("message")});
  if(error)throw new Error(error.message);
 }else if(moduleId==="wards"){
  if(role!=="admin"&&role!=="receptionist")throw new Error("Not authorised.");
  if(!val("name"))throw new Error("Ward name is required.");
  const {error}=await supabase.from("wards").insert({hospital_id:hospitalId,name:val("name"),ward_type:optional("ward_type"),gender_policy:optional("gender_policy"),is_active:true});
  if(error)throw new Error(error.message);
 }else{
  throw new Error("This workflow has not yet been enabled for live writes. No data was changed.");
 }
 revalidatePath("/admin");revalidatePath("/reception");revalidatePath("/staff");revalidatePath("/patient");
 return {ok:true,message:"Saved successfully to the hospital database."};
}
