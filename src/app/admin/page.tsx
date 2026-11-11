import { PortalShell } from "@/components/PortalShell";
import { requireRole } from "@/lib/supabase/guards";

export default async function AdminPage() {
  const { profile } = await requireRole(["admin"]);
  return <PortalShell kind="admin" displayName={profile.display_name} />;
}
