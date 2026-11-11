import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import LoginForm from "@/components/LoginForm";
import type { PortalRole } from "@/lib/auth/admin-session";

const portals: Record<PortalRole, { title: string; subtitle: string; badge: string; description: string }> = {
  admin: { title: "Administrator Portal", subtitle: "Hospital command centre", badge: "ADMINISTRATOR ACCESS", description: "Manage hospital operations, teams, services and system configuration from one secure workspace." },
  receptionist: { title: "Receptionist Portal", subtitle: "Front desk workspace", badge: "RECEPTION ACCESS", description: "Coordinate patient registration, appointments, arrivals, queues and reception enquiries." },
  staff: { title: "Staff Portal", subtitle: "Clinical team workspace", badge: "STAFF ACCESS", description: "Access the shared clinical workspace, patient directory, department queues and clinical records." },
  patient: { title: "Patient Portal", subtitle: "Your care, connected", badge: "PATIENT ACCESS", description: "Access your appointments, released health information and messages to the reception team." },
};
const roles: PortalRole[] = ["admin", "receptionist", "staff", "patient"];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ portal?: string }> }) {
  const params = await searchParams;
  const requested = params.portal as PortalRole;
  const portal: PortalRole = roles.includes(requested) ? requested : "admin";
  const config = portals[portal];
  return (
    <main className={`hms-login-page hms-login-${portal}`}>
      <header className="hms-login-topbar">
        <Link href="/" className="hms-login-brand"><span>✚</span><b>SAMZY HMS</b><small>SECURE HOSPITAL OPERATIONS</small></Link>
        <div><span className="hms-login-secure"><i /> SECURE PORTAL ACCESS</span><ThemeToggle /></div>
      </header>
      <section className="hms-login-layout">
        <aside className="hms-login-building-card">
          <div className="hms-login-neutral-building" aria-hidden="true"><span>✚</span><b>HOSPITAL</b><i>CARE · SERVICE · EXCELLENCE</i></div>
          <div className="hms-login-building-overlay" />
          <div className="hms-login-building-copy">
            <span>HOSPITAL MANAGEMENT SYSTEM</span>
            <h2>Care operations.<br /><em>Connected.</em></h2>
            <p>{config.description}</p>
            <div className="hms-login-building-foot"><span>✚</span><div><b>{config.subtitle}</b><small>Samzy HMS · Secure digital workspace</small></div></div>
          </div>
          <div className="hms-login-photo-label">HOSPITAL ENVIRONMENT</div>
        </aside>
        <section className="hms-login-panel">
          <div className="hms-login-card">
            <div className="hms-login-role-badge"><span>✦</span>{config.badge}</div>
            <div className="hms-login-heading">
              <span className="hms-login-heading-icon">{portal === "admin" ? "♜" : portal === "receptionist" ? "▤" : portal === "staff" ? "⚕" : "♡"}</span>
              <span><small>WELCOME TO SAMZY HMS</small><h1>{config.title}</h1></span>
            </div>
            <p className="hms-login-intro">Sign in with your portal username and password to continue.</p>
            <LoginForm portal={portal} />
            <div className="hms-login-divider"><span>PORTAL ACCESS</span></div>
            <nav className="hms-login-switch" aria-label="Choose portal">
              {roles.map((role) => <Link key={role} href={`/login?portal=${role}`} aria-current={portal === role ? "page" : undefined} className={portal === role ? "is-current" : ""}>
                <span>{role === "admin" ? "♜" : role === "receptionist" ? "▤" : role === "staff" ? "⚕" : "♡"}</span>{role === "admin" ? "Admin" : role === "receptionist" ? "Reception" : role === "staff" ? "Staff" : "Patient"}
              </Link>)}
            </nav>
            <p className="hms-login-security-note"><span>◈</span> Your credentials are checked securely on the server. Never share your password.</p>
          </div>
        </section>
      </section>
      <footer className="hms-login-footer"><span>© {new Date().getFullYear()} Samzy HMS</span><span>Secure access · Built by Samzy Technology</span><Link href="/">Return to homepage</Link></footer>
    </main>
  );
}
