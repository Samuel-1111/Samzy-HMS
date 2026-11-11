import { PortalShell } from "@/components/PortalShell";
import { requireRole } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";

export default async function ReceptionPage() {
  const { profile } = await requireRole(["receptionist"]);
  return <PortalShell kind="reception" displayName={profile.display_name} />;
}
