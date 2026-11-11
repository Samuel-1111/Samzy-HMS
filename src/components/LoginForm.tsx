"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInPortal } from "@/app/actions";
import type { PortalRole } from "@/lib/auth/admin-session";

export default function LoginForm({ portal }: { portal: PortalRole }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await signInPortal(portal, username, password);
      if (result.error) { setError(result.error); return; }
      if (!result.destination) { setError("Login was verified, but the destination was not returned. Please contact the system administrator."); return; }
      router.replace(result.destination);
      router.refresh();
    } catch (error) {
      console.error("Portal sign-in request failed:", error);
      setError("The sign-in request could not reach the application server. Refresh this page and try again. If it continues, check the latest Vercel Function Logs.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="hms-login-form" onSubmit={submit}>
      <label htmlFor="portal-username">USERNAME</label>
      <div className="hms-login-input-wrap"><span>♙</span><input id="portal-username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username" /></div>
      <label htmlFor="portal-password">PASSWORD</label>
      <div className="hms-login-input-wrap hms-login-password-wrap"><span>▣</span><input id="portal-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "HIDE" : "SHOW"}</button></div>
      {error ? <p className="hms-login-error" role="alert">{error}</p> : null}
      <button className="hms-login-submit" type="submit" disabled={busy}>{busy ? <><i className="hms-login-spinner" /> VERIFYING CREDENTIALS…</> : <>SIGN IN SECURELY <span>→</span></>}</button>
      <small className="hms-login-form-note">Username only. Email addresses and phone numbers are not accepted.</small>
    </form>
  );
}
