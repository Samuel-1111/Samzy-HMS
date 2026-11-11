import Link from "next/link";

const checks = [
  ["Database schema", "44 tables provisioned", "done"],
  ["Row-level security", "Enabled on all public tables", "done"],
  ["Supabase SSR authentication", "Integration code added", "done"],
  ["Hospital tenant and user accounts", "Not configured", "pending"],
  ["Clinical workflows and acceptance tests", "Pending implementation", "pending"],
];

export default function Home() {
  return (
    <main className="setup-home">
      <header className="setup-header">
        <Link href="/" className="setup-brand"><span>S</span><b>SAMZY HMS</b></Link>
        <small>BUILT BY SAMZY TECHNOLOGY</small>
      </header>
      <section className="setup-hero">
        <div className="setup-eyebrow">HOSPITAL OPERATIONS PLATFORM</div>
        <h1>Samzy HMS</h1>
        <p>A secure, configurable foundation for hospital administration, reception, clinical teams and patient services.</p>
        <div className="setup-state"><i /> DATABASE FOUNDATION PROVISIONED</div>
        <Link href="/login" className="setup-login-link">Secure sign in <span>↗</span></Link>
      </section>
      <section className="setup-panel">
        <div className="setup-panel-heading">
          <div><span>IMPLEMENTATION STATUS</span><h2>System readiness</h2></div>
          <b>EMPTY DATABASE</b>
        </div>
        <div className="setup-check-list">
          {checks.map(([name, status, state]) => (
            <div className="setup-check" key={name}>
              <span className={state === "done" ? "setup-check-icon done" : "setup-check-icon"}>{state === "done" ? "✓" : "○"}</span>
              <b>{name}</b><small>{status}</small>
            </div>
          ))}
        </div>
        <p className="setup-warning">
          No hospital tenant or user accounts have been created. Portal access is available only to provisioned,
          authorised accounts. Clinical workflows remain locked until hospital configuration and acceptance tests pass.
        </p>
      </section>
      <footer className="setup-footer">Samzy HMS · Built by Samzy Technology · Not yet approved for clinical production use</footer>
    </main>
  );
}
