export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/auth/admin-session";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const session = await getPortalSession();
  if (!session) redirect("/login");
  if (!session.mustChangePassword) redirect(session.role === "admin" ? "/admin" : session.role === "receptionist" ? "/reception" : session.role === "staff" ? "/staff" : "/login");
  return <ChangePasswordForm />;
}
