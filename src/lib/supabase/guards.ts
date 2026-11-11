import { redirect } from "next/navigation";
import { getPortalSession, type PortalRole } from "@/lib/auth/admin-session";

export type AppRole = PortalRole;

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await getPortalSession(allowedRoles);
  if (!session) redirect("/login");
  if (session.mustChangePassword) redirect("/account/change-password");
  return {
    user: { id: session.userId, app_metadata: { role: session.role, hospital_id: session.hospitalId } },
    profile: {
      id: session.userId,
      hospital_id: session.hospitalId,
      display_name: session.displayName,
      is_active: true,
      must_change_password: session.mustChangePassword,
      role: session.role,
    },
  };
}
