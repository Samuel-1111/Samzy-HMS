"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { changeOwnPassword } from "@/app/actions";

export function PasswordChangeForm() {
  const router = useRouter();
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");
    try{
      const result=await changeOwnPassword(password,confirm);
      if(result.error)throw new Error(result.error);
      router.replace(result.destination??"/login");router.refresh();
    }catch(e){setError(e instanceof Error?e.message:"Unable to update password.");}
    finally{setBusy(false);}
  }
  return <form className="login-form" onSubmit={submit}>
    <label htmlFor="new-password">New password</label>
    <input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 12 characters"/>
    <label htmlFor="confirm-password">Confirm new password</label>
    <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter new password"/>
    {error&&<p className="login-error" role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy?"Updating…":"Save new password"}</button>
  </form>;
}