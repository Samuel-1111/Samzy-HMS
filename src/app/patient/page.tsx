import { PortalShell } from "@/components/PortalShell";
import { requireRole } from "@/lib/supabase/guards";

export default async function PatientPage() {
  const { profile } = await requireRole(["patient"]);
  return <PortalShell kind="patient" displayName={profile.display_name} />;
}
