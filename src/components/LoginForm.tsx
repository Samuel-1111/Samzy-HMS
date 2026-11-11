"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInPortal } from "@/app/actions";

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await signInPortal(identifier, password);
      if (result.error) { setError(result.error); return; }
      if (!result.destination) { setError("We could not determine your portal. Please contact the system administrator."); return; }
      router.replace(result.destination); router.refresh();
    } catch {
      // Never expose framework, database, or provider exceptions in the login UI.
      setError("We could not complete sign-in. Please try again or contact the system administrator.");
    } finally { setBusy(false); }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="login-identifier">Username, email address or phone number</label>
      <input id="login-identifier" autoComplete="username" required value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Enter your username" />
      <label htmlFor="login-password">Password</label>
      <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
      {error ? <p className="login-error" role="alert">{error}</p> : null}
      <button type="submit" disabled={busy}>{busy ? "Verifying…" : "Secure sign in"}</button>
      <small>Use the credentials issued by your hospital administrator. First-time users must change their temporary password.</small>
    </form>
  );
}