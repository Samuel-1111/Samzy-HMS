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
      if (result.error) throw new Error(result.error);
      if (!result.destination) throw new Error("Unable to determine your portal.");
      router.replace(result.destination); router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in. Check your details and try again.");
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