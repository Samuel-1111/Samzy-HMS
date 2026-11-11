"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changeOwnPassword, signOut } from "@/app/actions";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await changeOwnPassword(password, confirm);
      if (result.error) { setError(result.error); return; }
      router.replace(result.destination ?? "/login");
      router.refresh();
    } catch {
      setError("Password update failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl space-y-5">
        <div className="text-sm font-semibold tracking-[0.2em] text-cyan-300">SAMZY HMS · ACCOUNT SECURITY</div>
        <h1 className="text-2xl font-bold">Change your temporary password</h1>
        <p className="text-sm text-slate-300">Set a private password before entering the hospital workspace.</p>
        <label className="block text-sm">New password
          <input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <label className="block text-sm">Confirm new password
          <input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e => setConfirm(e.target.value)} />
        </label>
        {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
        <button disabled={busy} className="w-full rounded-xl bg-cyan-500 p-3 font-bold text-slate-950 disabled:opacity-50">{busy ? "UPDATING…" : "SAVE NEW PASSWORD"}</button>
        <button type="button" onClick={() => signOut()} className="w-full p-2 text-sm text-slate-400">Sign out</button>
      </form>
    </main>
  );
}
