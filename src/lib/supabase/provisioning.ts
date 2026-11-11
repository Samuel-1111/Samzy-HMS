import "server-only";
import type { AppRole } from "@/lib/supabase/guards";
import { createAdminClient } from "@/lib/supabase/admin";

type ProvisionUserInput = {
  hospitalId: string;
  role: AppRole;
  displayName: string;
  loginUsername: string;
  password: string;
  email?: string;
  authEmail?: string;
  phone?: string;
  patientId?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  mustChangePassword?: boolean;
};

export async function provisionHospitalUser(input: ProvisionUserInput) {
  if (!input.email && !input.phone && !input.authEmail) throw new Error("An authentication email or phone number is required.");
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(input.loginUsername)) throw new Error("Username must be 3–32 lowercase letters, numbers, dots, underscores or hyphens.");
  if (input.role === "patient" && !input.patientId) throw new Error("A patient account must be linked to an existing permanent Patient ID.");

  const admin = createAdminClient();
  if (input.role === "staff" || input.role === "admin") {
    const { count, error } = await admin.from("user_profiles").select("id", { count: "exact", head: true })
      .eq("hospital_id", input.hospitalId).eq("role", input.role);
    if (error) throw new Error(error.message);
    if ((count ?? 0) > 0) throw new Error(input.role === "staff" ? "A shared Staff Portal account already exists." : "The hospital already has its single Admin account.");
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email ?? input.authEmail, phone: input.phone, password: input.password,
    email_confirm: Boolean(input.authEmail) || Boolean(input.email && input.emailVerified),
    phone_confirm: Boolean(input.phone && input.phoneVerified),
    app_metadata: { hospital_id: input.hospitalId, role: input.role },
    user_metadata: { display_name: input.displayName },
  });
  if (error || !data.user) throw new Error(error?.message ?? "Supabase did not return the created account.");

  const userId = data.user.id;
  if (input.role === "patient" && input.patientId) {
    const { data: patient, error: patientError } = await admin.from("patients").update({ auth_user_id: userId })
      .eq("id", input.patientId).eq("hospital_id", input.hospitalId).select("id").maybeSingle();
    if (patientError || !patient) {
      await admin.auth.admin.deleteUser(userId);
      throw new Error(patientError?.message ?? "Patient ID was not found in this hospital.");
    }
  }

  const { error: profileError } = await admin.from("user_profiles").insert({
    hospital_id: input.hospitalId, auth_user_id: userId, role: input.role,
    display_name: input.displayName, login_username: input.loginUsername,
    email: input.email ?? null, phone: input.phone ?? null, is_active: true,
    must_change_password: input.mustChangePassword ?? true,
  });
  if (profileError) {
    if (input.role === "patient" && input.patientId) await admin.from("patients").update({ auth_user_id: null }).eq("id", input.patientId).eq("hospital_id", input.hospitalId);
    await admin.auth.admin.deleteUser(userId);
    throw new Error(profileError.message);
  }
  return { userId };
}