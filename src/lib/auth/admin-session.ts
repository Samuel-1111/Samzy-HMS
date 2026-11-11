import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PortalRole = "admin" | "receptionist" | "staff" | "patient";

export type PortalSession = {
  userId: string;
  username: string;
  role: PortalRole;
  hospitalId: string;
  displayName: string;
  mustChangePassword: boolean;
};

const validRoles: PortalRole[] = ["admin", "receptionist", "staff", "patient"];

export async function getPortalSession(allowedRoles?: PortalRole[]): Promise<PortalSession | null> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const admin = createAdminClient();
  const { data: profile, error } = await admin.from("user_profiles")
    .select("auth_user_id,hospital_id,login_username,role,display_name,is_active,must_change_password")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error || !profile || !profile.is_active || !validRoles.includes(profile.role as PortalRole)) return null;
  const role = profile.role as PortalRole;
  if (allowedRoles && !allowedRoles.includes(role)) return null;

  // app_metadata is server-controlled; cross-check it against the database profile.
  if (user.app_metadata?.role !== role || user.app_metadata?.hospital_id !== profile.hospital_id) return null;

  return {
    userId: user.id,
    username: profile.login_username ?? user.id,
    role,
    hospitalId: profile.hospital_id,
    displayName: profile.display_name,
    mustChangePassword: profile.must_change_password,
  };
}

export async function clearPortalSession() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
