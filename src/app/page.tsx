import Link from "next/link";

const checks = [
  ["Database schema", "Provisioned", "done"],
  ["Row-level security", "Enabled on all 44 tables", "done"],
  ["Hospital tenant and user accounts", "Not configured", "pending"],
  ["Secure portal authentication", "Pending integration", "pending"],
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
          Portal access is intentionally locked until authentication and server-side authorisation are connected.
          No hospital has been configured and no operational or sample data exists.
        </p>
      </section>
      <footer className="setup-footer">Samzy HMS · Built by Samzy Technology · Not yet approved for clinical production use</footer>
    </main>
  );
}
