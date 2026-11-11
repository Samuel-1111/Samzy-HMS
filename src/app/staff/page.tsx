import { PortalShell } from "@/components/PortalShell";
import { requireRole } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const { profile } = await requireRole(["staff"]);
  return <PortalShell kind="staff" displayName={profile.display_name} />;
}
