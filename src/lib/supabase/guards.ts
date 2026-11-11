import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";

export type AppRole = "admin" | "receptionist" | "staff" | "patient";

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  if (!allowedRoles.includes("admin") || !allowedRoles.includes(session.role)) redirect("/unauthorized");
  return {
    user: { id: session.username, app_metadata: { role: "admin" as const } },
    profile: { display_name: session.username, is_active: true, role: "admin" as const },
  };
}
