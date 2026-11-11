import Link from "next/link";

type Kind = "admin" | "reception" | "staff" | "patient";

const portalNames: Record<Kind, string> = {
  admin: "Administrator Portal",
  reception: "Reception Portal",
  staff: "Shared Staff Portal",
  patient: "Patient Portal",
};

export function PortalShell({ kind }: { kind: Kind }) {
  return (
    <main className="portal-lock-page">
      <section className="portal-lock-card">
        <Link href="/" className="portal-lock-brand" aria-label="Samzy HMS home">
          <span className="portal-lock-mark">S</span>
          <span><b>SAMZY HMS</b><small>HOSPITAL OPERATIONS</small></span>
        </Link>
        <div className="portal-lock-status"><span /> SECURE ACCESS NOT ENABLED</div>
        <h1>{portalNames[kind]}</h1>
        <p className="portal-lock-lead">
          This workspace is reserved for authorised users. Sign-in, verified roles and server-side access checks
          must be completed before the portal can be opened.
        </p>
        <div className="portal-lock-checks">
          <div><span>✓</span><section><b>Database foundation created</b><small>Core hospital tables and relationships are provisioned.</small></section></div>
          <div><span>✓</span><section><b>Row-level security enabled</b><small>Tenant and role policies are in place; access remains denied without valid claims.</small></section></div>
          <div><span>○</span><section><b>Authentication integration pending</b><small>No user accounts or hospital tenant have been created.</small></section></div>
          <div><span>○</span><section><b>Clinical workflows pending</b><small>Do not enter real patient information until end-to-end testing is complete.</small></section></div>
        </div>
        <div className="portal-lock-note">The database is intentionally empty. No sample patients, staff, appointments or transactions have been added.</div>
        <Link href="/" className="portal-lock-home">← Return to Samzy HMS</Link>
      </section>
    </main>
  );
}
