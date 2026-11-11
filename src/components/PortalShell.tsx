import { PortalWorkspace } from "@/components/PortalWorkspace";
type Kind = "admin" | "reception" | "staff" | "patient";
export function PortalShell({ kind, displayName }: { kind: Kind; displayName: string }) { return <PortalWorkspace kind={kind} displayName={displayName} />; }
