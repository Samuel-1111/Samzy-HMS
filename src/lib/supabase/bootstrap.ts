import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import { provisionHospitalUser } from "@/lib/supabase/provisioning";

type BootstrapHospitalInput = {
  slug: string; legalName: string; displayName: string; timezone?: string;
  phone?: string; email?: string; address?: Json;
  initialAdmin: {
    displayName: string; loginUsername: string; password: string;
    email?: string; phone?: string; emailVerified?: boolean; phoneVerified?: boolean;
  };
};

export async function bootstrapHospital(input: BootstrapHospitalInput) {
  const admin = createAdminClient();
  const { data: hospital, error } = await admin.from("hospitals").insert({
    slug: input.slug, legal_name: input.legalName, display_name: input.displayName,
    timezone: input.timezone ?? "Africa/Lagos", phone: input.phone ?? null,
    email: input.email ?? null, address: input.address ?? {},
  }).select("id").single();
  if (error || !hospital) throw new Error(error?.message ?? "Hospital tenant could not be created.");
  try {
    const account = await provisionHospitalUser({
      hospitalId: hospital.id, role: "admin", displayName: input.initialAdmin.displayName,
      loginUsername: input.initialAdmin.loginUsername, password: input.initialAdmin.password,
      email: input.initialAdmin.email, phone: input.initialAdmin.phone,
      emailVerified: input.initialAdmin.emailVerified, phoneVerified: input.initialAdmin.phoneVerified,
      mustChangePassword: true,
    });
    return { hospitalId: hospital.id, adminUserId: account.userId };
  } catch (cause) {
    await admin.from("hospitals").delete().eq("id", hospital.id);
    throw cause;
  }
}