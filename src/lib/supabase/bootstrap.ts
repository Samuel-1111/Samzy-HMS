import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionHospitalUser } from "@/lib/supabase/provisioning";

type BootstrapHospitalInput = {
  slug: string;
  legalName: string;
  displayName: string;
  timezone?: string;
  phone?: string;
  email?: string;
  address?: Record<string, unknown>;
  initialAdmin: {
    displayName: string;
    password: string;
    email?: string;
    phone?: string;
  };
};

/**
 * One-time trusted setup after a hospital has approved the system.
 * This function is not exposed as a public endpoint and is never run automatically.
 */
export async function bootstrapHospital(input: BootstrapHospitalInput) {
  const admin = createAdminClient();
  const { data: hospital, error } = await admin
    .from("hospitals")
    .insert({
      slug: input.slug,
      legal_name: input.legalName,
      display_name: input.displayName,
      timezone: input.timezone ?? "Africa/Lagos",
      phone: input.phone ?? null,
      email: input.email ?? null,
      address: input.address ?? {},
    })
    .select("id")
    .single();

  if (error || !hospital) {
    throw new Error(error?.message ?? "Hospital tenant could not be created.");
  }

  try {
    const account = await provisionHospitalUser({
      hospitalId: hospital.id,
      role: "admin",
      displayName: input.initialAdmin.displayName,
      password: input.initialAdmin.password,
      email: input.initialAdmin.email,
      phone: input.initialAdmin.phone,
    });
    return { hospitalId: hospital.id, adminUserId: account.userId };
  } catch (cause) {
    await admin.from("hospitals").delete().eq("id", hospital.id);
    throw cause;
  }
}
