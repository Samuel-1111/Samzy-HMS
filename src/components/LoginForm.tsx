"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function normalizeNigerianPhone(value: string) {
  const trimmed = value.split(" ").join("").replaceAll("(", "").replaceAll(")", "").replaceAll("-", "");
  if (trimmed.startsWith("0") && trimmed.length === 11) return `+234${trimmed.slice(1)}`;
  if (trimmed.startsWith("234")) return `+${trimmed}`;
  return trimmed;
}

const destinations: Record<string, string> = {
  admin: "/admin",
  receptionist: "/reception",
  staff: "/staff",
  patient: "/patient",
};

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const supabase = createClient();
      const isEmail = identifier.includes("@");
      const credentials = isEmail
        ? { email: identifier.trim().toLowerCase(), password }
        : { phone: normalizeNigerianPhone(identifier), password };

      const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
      if (signInError) throw signInError;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError ?? new Error("Account verification failed.");

      const role = String(user.app_metadata?.role ?? "");
      const destination = destinations[role];
      if (!destination) {
        await supabase.auth.signOut();
        throw new Error("This account has no approved Samzy HMS role. Contact the system administrator.");
      }

      router.replace(destination);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="login-identifier">Email address or phone number</label>
      <input id="login-identifier" autoComplete="username" required value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Email or phone number" />
      <label htmlFor="login-password">Password</label>
      <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
      {error ? <p className="login-error" role="alert">{error}</p> : null}
      <button type="submit" disabled={busy}>{busy ? "Verifying…" : "Secure sign in"}</button>
      <small>Accounts are created by an authorised administrator. Public self-registration is disabled.</small>
    </form>
  );
}
