import { redirect } from "next/navigation";
import { getPortalSession, type PortalRole } from "@/lib/auth/admin-session";

export type AppRole = PortalRole;

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await getPortalSession(allowedRoles);
  if (!session) redirect("/login");
  const names: Record<PortalRole, string> = {
    admin: "Administrator",
    receptionist: "Receptionist",
    staff: "Staff",
    patient: "Patient",
  };
  return {
    user: { id: session.username, app_metadata: { role: session.role } },
    profile: { display_name: names[session.role], is_active: true, role: session.role },
  };
}
