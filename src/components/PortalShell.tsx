import Link from "next/link";
import { signOut } from "@/app/actions";

type Kind = "admin" | "reception" | "staff" | "patient";
const names: Record<Kind, string> = {
  admin: "Administrator Portal",
  reception: "Reception Portal",
  staff: "Shared Staff Portal",
  patient: "Patient Portal",
};

export function PortalShell({ kind, displayName }: { kind: Kind; displayName: string }) {
  return (
    <main className="portal-lock-page">
      <section className="portal-lock-card">
        <Link href="/" className="portal-lock-brand">
          <span className="portal-lock-mark">S</span>
          <span><b>SAMZY HMS</b><small>HOSPITAL OPERATIONS</small></span>
        </Link>
        <div className="portal-lock-status"><span /> IDENTITY VERIFIED</div>
        <h1>{names[kind]}</h1>
        <p className="portal-lock-lead">Signed in as <strong>{displayName}</strong>. Your account identity and role were verified against Supabase Auth and the hospital user profile.</p>
        <div className="portal-lock-checks">
          <div><span>✓</span><section><b>Secure session verified</b><small>Server-side session validation is active.</small></section></div>
          <div><span>✓</span><section><b>Role and tenant claims checked</b><small>Access is limited by signed Auth metadata and row-level security.</small></section></div>
          <div><span>○</span><section><b>Hospital workspace not initialized</b><small>No hospital tenant, user accounts or operational records have been seeded yet.</small></section></div>
          <div><span>○</span><section><b>Operational modules not released</b><small>Clinical and administrative workflows remain disabled until hospital configuration and acceptance tests are complete.</small></section></div>
        </div>
        <div className="portal-lock-note">The database remains intentionally empty. Do not enter patient information until the hospital workspace is configured and production validation is signed off.</div>
        <form action={signOut}><button className="portal-lock-home" type="submit">Sign out securely</button></form>
      </section>
    </main>
  );
}
