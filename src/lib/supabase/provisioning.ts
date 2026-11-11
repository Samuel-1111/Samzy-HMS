import type { AppRole } from "@/lib/supabase/guards";
import { createAdminClient } from "@/lib/supabase/admin";

type ProvisionUserInput = {
  hospitalId: string;
  role: AppRole;
  displayName: string;
  password: string;
  email?: string;
  phone?: string;
  patientId?: string;
};

/**
 * Trusted server-only account provisioning.
 * Admin/Reception accounts are individual; create exactly one shared Staff account.
 * Patient accounts must be linked to an existing permanent Patient ID.
 */
export async function provisionHospitalUser(input: ProvisionUserInput) {
  if (!input.email && !input.phone) throw new Error("An email or phone number is required.");
  if (input.role === "patient" && !input.patientId) {
    throw new Error("A patient account must be linked to an existing Patient ID.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    phone: input.phone,
    password: input.password,
    email_confirm: Boolean(input.email),
    phone_confirm: Boolean(input.phone),
    app_metadata: {
      hospital_id: input.hospitalId,
      role: input.role,
    },
    user_metadata: {
      display_name: input.displayName,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Supabase did not return the created account.");
  }

  const userId = data.user.id;

  if (input.role === "patient" && input.patientId) {
    const { data: patient, error: patientError } = await admin
      .from("patients")
      .update({ auth_user_id: userId })
      .eq("id", input.patientId)
      .eq("hospital_id", input.hospitalId)
      .select("id")
      .maybeSingle();

    if (patientError || !patient) {
      await admin.auth.admin.deleteUser(userId);
      throw new Error(patientError?.message ?? "Patient ID was not found in this hospital.");
    }
  }

  const { error: profileError } = await admin.from("user_profiles").insert({
    hospital_id: input.hospitalId,
    auth_user_id: userId,
    role: input.role,
    display_name: input.displayName,
    email: input.email ?? null,
    phone: input.phone ?? null,
    is_active: true,
  });

  if (profileError) {
    if (input.role === "patient" && input.patientId) {
      await admin.from("patients").update({ auth_user_id: null }).eq("id", input.patientId).eq("hospital_id", input.hospitalId);
    }
    await admin.auth.admin.deleteUser(userId);
    throw new Error(profileError.message);
  }

  return { userId };
}
