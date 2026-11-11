import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "receptionist" | "staff" | "patient";

export async function requireRole(allowedRoles: AppRole[]) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const role = user.app_metadata?.role as AppRole | undefined;
  const hospitalId = user.app_metadata?.hospital_id as string | undefined;

  if (!role || !hospitalId || !allowedRoles.includes(role)) {
    redirect("/unauthorized");
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("display_name,is_active,role,hospital_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    !profile.is_active ||
    profile.role !== role ||
    profile.hospital_id !== hospitalId
  ) {
    await supabase.auth.signOut();
    redirect("/login?reason=account-unavailable");
  }

  return { user, profile };
}
