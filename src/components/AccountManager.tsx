"use client";
import { useEffect, useState } from "react";
import { getPortalAccountSetupStatus } from "@/app/actions";

type SetupStatus = {
  admin: { configured: boolean; username: boolean; password: boolean };
  receptionist: { configured: boolean; username: boolean; password: boolean };
  staff: { configured: boolean; username: boolean; password: boolean };
  patient: { configured: boolean; username: boolean; password: boolean };
  hospitalWorkspaceConfigured: boolean;
  cctvBridgeConfigured: boolean;
};

const roles = [
  { key: "admin", label: "Administrator", username: "admin_username", password: "admin_password" },
  { key: "receptionist", label: "Receptionist · single shared account", username: "receptionist_username", password: "receptionist_password" },
  { key: "staff", label: "Staff · single shared account", username: "staff_username", password: "staff_password" },
  { key: "patient", label: "Patient · shared login not approved for PHI", username: "patient_username", password: "patient_password" },
] as const;

export function AccountManager() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refresh() {
    setLoading(true); setError("");
    try { setStatus(await getPortalAccountSetupStatus() as SetupStatus); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to verify portal setup."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);
  return <div className="hms-module-page">
    <section className="hms-module-intro"><div><span className="hms-eyebrow">ADMINISTRATION · ACCESS CONTROL</span><h2>Portal accounts & credentials</h2><p>Each portal has one Vercel environment-variable credential pair. Password values are never displayed in this dashboard.</p></div><span className="hms-module-icon">♙</span></section>
    {error && <div className="hms-notice hms-notice-error" role="alert">{error}</div>}
    <section className="hms-panel">
      <div className="hms-panel-heading"><div><span className="hms-eyebrow">VERCEL ENVIRONMENT</span><h3>Portal credential status</h3><p>Set these values in Vercel → Project → Settings → Environment Variables, then redeploy.</p></div><button className="hms-filter" type="button" onClick={()=>void refresh()}>↻ Refresh status</button></div>
      {loading ? <p>Checking secure configuration…</p> : status && <div className="hms-account-env-grid">{roles.map(role => {
        const configured = status[role.key].configured;
        return <article key={role.key} className="hms-account-env-card"><div><b>{role.label}</b><span className={configured?"hms-env-state is-ready":"hms-env-state"}>{configured?"CONFIGURED":"MISSING CREDENTIALS"}</span></div><p>Username variable: <code>{role.username}</code><br/>Password variable: <code>{role.password}</code></p><small>{status[role.key].username?"Username set":"Username missing"} · {status[role.key].password?"Password set":"Password missing"}</small></article>;
      })}</div>}
    </section>
    <section className="hms-panel">
      <div className="hms-panel-heading"><div><span className="hms-eyebrow">WORKSPACE READINESS</span><h3>Hospital services configuration</h3><p>These services are separate from portal login credentials.</p></div></div>
      <div className="hms-account-env-grid">
        <article className="hms-account-env-card"><b>Hospital database workspace</b><span className={status?.hospitalWorkspaceConfigured?"hms-env-state is-ready":"hms-env-state"}>{status?.hospitalWorkspaceConfigured?"ID CONFIGURED":"NOT CONFIGURED"}</span><p>Required server variable: <code>HMS_HOSPITAL_ID</code></p></article>
        <article className="hms-account-env-card"><b>CCTV local discovery bridge</b><span className={status?.cctvBridgeConfigured?"hms-env-state is-ready":"hms-env-state"}>{status?.cctvBridgeConfigured?"BRIDGE CONFIGURED":"BRIDGE NOT CONNECTED"}</span><p>Required variables: <code>CCTV_DISCOVERY_BRIDGE_URL</code> and <code>CCTV_DISCOVERY_BRIDGE_TOKEN</code></p></article>
      </div>
    </section>
    <section className="hms-panel">
      <div className="hms-panel-heading"><div><h3>How to set up Reception and Staff</h3><p>Use one credential pair for each shared portal, as requested.</p></div></div>
      <ol className="hms-env-instructions"><li>Open the Samzy HMS project in Vercel.</li><li>Go to <b>Settings → Environment Variables</b>.</li><li>Add <code>receptionist_username</code> and <code>receptionist_password</code> for the single Reception login.</li><li>Add <code>staff_username</code> and <code>staff_password</code> for the single shared Staff login.</li><li>Save, redeploy the latest deployment, then sign in using the exact username and password.</li></ol>
      <p className="hms-data-note">Never put passwords in client-side variables, screenshots, source code, or chat messages. The shared Staff login cannot reliably identify which staff member created a clinical entry; the author name is manually recorded.</p>
    </section>
  </div>;
}
