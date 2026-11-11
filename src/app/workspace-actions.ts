"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Role="admin"|"receptionist"|"staff"|"patient";
type FormValues=Record<string,string|boolean|undefined>;
async function context(allowed:Role[]){
 const supabase=await createClient();
 const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user) throw new Error("Your session has expired. Sign in again.");
 const role=user.app_metadata?.role as Role|undefined;
 const hospitalId=user.app_metadata?.hospital_id as string|undefined;
 if(!role||!hospitalId||!allowed.includes(role)) throw new Error("You do not have permission to perform this action.");
 const {data:profile}=await supabase.from("user_profiles").select("is_active,role,hospital_id,must_change_password").eq("auth_user_id",user.id).maybeSingle();
 if(!profile?.is_active||profile.role!==role||profile.hospital_id!==hospitalId) throw new Error("Your account is inactive or unavailable.");
 if(profile.must_change_password) throw new Error("Change your temporary password before using the portal.");
 return {supabase,user,role,hospitalId};
}
export async function loadWorkspaceRecords(moduleId:string){
 const {supabase,hospitalId,role}=await context(["admin","receptionist","staff","patient"]);
 const limit=75;
 switch(moduleId){
  case "departments": {const {data,error}=await supabase.from("departments").select("id,name,code,description,is_active,created_at").eq("hospital_id",hospitalId).order("name").limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "staff": {if(role!=="admin"&&role!=="receptionist")throw new Error("Not authorised.");const {data,error}=await supabase.from("staff_directory").select("id,full_name,staff_number,job_title,phone,email,is_active,department_id").eq("hospital_id",hospitalId).order("full_name").limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "patients": {if(role==="patient"){const {data,error}=await supabase.from("patients").select("id,patient_number,first_name,middle_name,last_name,phone,email,patient_category,record_status,date_of_birth,sex").eq("hospital_id",hospitalId).eq("auth_user_id",(await supabase.auth.getUser()).data.user!.id).limit(1);if(error)throw new Error(error.message);return data??[];}const {data,error}=await supabase.from("patients").select("id,patient_number,first_name,middle_name,last_name,phone,email,patient_category,record_status,date_of_birth,sex,created_at").eq("hospital_id",hospitalId).order("created_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "appointments": {const q=supabase.from("appointments").select("id,patient_id,department_id,requested_at,scheduled_at,reason,status,receptionist_notes").eq("hospital_id",hospitalId).order("requested_at",{ascending:false}).limit(limit);const {data,error}=await q;if(error)throw new Error(error.message);return data??[];}
  case "cctv": {if(role!=="admin")throw new Error("Only Admin can manage CCTV inventory.");const {data,error}=await supabase.from("cctv_cameras").select("id,camera_name,location_label,integration_type,external_camera_id,is_enabled,created_at").eq("hospital_id",hospitalId).order("created_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
  case "messages": {if(role!=="admin"&&role!=="receptionist"&&role!=="patient")throw new Error("Not authorised.");const {data,error}=await supabase.from("patient_messages").select("id,patient_id,sender_type,message,created_at,read_at").eq("hospital_id",hospitalId).order("created_at",{ascending:false}).limit(limit);if(error)throw new Error(error.message);return data??[];}
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
 const {supabase,user,hospitalId,role}=await context(["admin","receptionist","staff","patient"]);
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
  const {error}=await supabase.from("patients").insert({hospital_id:hospitalId,patient_number:"",first_name:val("first_name"),middle_name:optional("middle_name"),last_name:val("last_name"),date_of_birth:optional("date_of_birth"),sex:(val("sex")||"not_recorded") as "female"|"male"|"intersex"|"unknown"|"not_recorded",phone:optional("phone"),email:optional("email"),patient_category:(val("patient_category")||"private") as "nhia"|"hmo"|"private"|"self_pay",record_status:"active",created_by:user.id});
  if(error)throw new Error(error.message);
 }else if(moduleId==="appointments"){
  if(role!=="admin"&&role!=="receptionist"&&role!=="patient")throw new Error("Not authorised to request appointments.");
  if(!val("patient_id")||!val("reason"))throw new Error("Patient ID and appointment reason are required.");
  const {error}=await supabase.from("appointments").insert({hospital_id:hospitalId,patient_id:val("patient_id"),department_id:optional("department_id"),scheduled_at:optional("scheduled_at"),reason:val("reason"),status:"requested",created_by:user.id});
  if(error)throw new Error(error.message);
 }else if(moduleId==="cctv"){
  if(role!=="admin")throw new Error("Only Admin can register CCTV equipment.");
  if(!val("camera_name")||!val("location_label"))throw new Error("Camera name and approved location are required.");
  const {error}=await supabase.from("cctv_cameras").insert({hospital_id:hospitalId,camera_name:val("camera_name"),location_label:val("location_label"),integration_type:optional("integration_type"),external_camera_id:optional("external_camera_id"),is_enabled:false});
  if(error)throw new Error(error.message);
 }else if(moduleId==="records"){
  if(role!=="staff")throw new Error("Clinical record entry is restricted to the Staff Portal.");
  if(!val("patient_id")||!val("encounter_id")||!val("author_name")||!val("title")||!val("content"))throw new Error("Patient, encounter, author, title and note content are required.");
  const {error}=await supabase.from("medical_records").insert({hospital_id:hospitalId,patient_id:val("patient_id"),encounter_id:val("encounter_id"),department_id:optional("department_id"),author_user_id:user.id,author_name:val("author_name"),author_role:"staff",title:val("title"),record_type:(val("record_type")||"clinical_note") as "consultation"|"clinical_note"|"nursing_note"|"assessment"|"procedure"|"discharge_summary"|"other",content:{note:val("content")},patient_visible:false});
  if(error)throw new Error(error.message);
 }else if(moduleId==="messages"){
  if(role!=="admin"&&role!=="receptionist"&&role!=="patient")throw new Error("Staff cannot access patient messaging.");
  if(!val("patient_id")||!val("message"))throw new Error("Patient ID and message are required.");
  const sender=role==="patient"?"patient":"receptionist";
  const {error}=await supabase.from("patient_messages").insert({hospital_id:hospitalId,patient_id:val("patient_id"),sender_type:sender,sender_user_id:user.id,message:val("message")});
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
