"use client";
import {useCallback,useEffect,useState} from "react";
import {createPortalAccount,listPortalAccounts,managePortalAccount} from "@/app/actions";

type Account={id:string;display_name:string;login_username:string|null;role:string;email:string|null;phone:string|null;is_active:boolean;must_change_password:boolean;created_at:string};
export function AccountManager(){
 const [accounts,setAccounts]=useState<Account[]>([]);
 const [displayName,setDisplayName]=useState("");
 const [username,setUsername]=useState("");
 const [role,setRole]=useState<"receptionist"|"staff">("receptionist");
 const [email,setEmail]=useState("");
 const [phone,setPhone]=useState("");
 const [verified,setVerified]=useState(false);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [issued,setIssued]=useState<{username:string;temporaryPassword:string;role:string}|null>(null);
 const refresh=useCallback(async()=>{setLoading(true);setError("");try{setAccounts(await listPortalAccounts() as Account[]);}catch(e){setError(e instanceof Error?e.message:"Unable to load accounts.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");setSuccess("");setIssued(null);
  try{
   const result=await createPortalAccount({displayName,username,role,email:email||undefined,phone:phone||undefined,contactVerified:verified});
   setIssued(result);setSuccess("Account created. Copy the temporary password now; it will not be shown again.");
   setDisplayName("");setUsername("");setEmail("");setPhone("");setVerified(false);
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Account creation failed.");}
  finally{setBusy(false);}
 }
 async function manage(profileId:string,operation:"reset_password"|"suspend"|"reactivate"){
  setError("");setSuccess("");setIssued(null);
  try{
   const result=await managePortalAccount({profileId,operation});
   if("temporaryPassword" in result && typeof result.temporaryPassword === "string") setIssued({username:"username" in result ? String(result.username ?? "") : "",temporaryPassword:result.temporaryPassword,role:"account"});
   setSuccess(operation==="reset_password"?"New temporary password generated. Share it securely; the user must change it at next login.":operation==="suspend"?"Account suspended.":"Account reactivated.");
   await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Account update failed.");}
 }
 const staffExists=accounts.some(a=>a.role==="staff");
 return <div className="hms-module-page">
  <section className="hms-module-intro"><div><span className="hms-eyebrow">ADMINISTRATION · ACCESS CONTROL</span><h2>User & account management</h2><p>Create Receptionist accounts individually and provision exactly one shared Staff Portal account.</p></div><span className="hms-module-icon">♙</span></section>
  {error&&<div className="hms-notice hms-notice-error" role="alert">{error}</div>}
  {success&&<div className="hms-notice" role="status">{success}</div>}
  {issued&&<section className="hms-account-issued"><div><b>Temporary credentials · {issued.role==="staff"?"Shared Staff Portal":"Receptionist"}</b><p>Give these details directly to the authorised user. They must change the password on first login.</p></div><label>Username<input readOnly value={issued.username}/></label><label>Temporary password<input readOnly value={issued.temporaryPassword}/></label><button type="button" onClick={()=>void navigator.clipboard.writeText("Username: "+issued.username+"\nTemporary password: "+issued.temporaryPassword)}>Copy credentials</button></section>}
  <section className="hms-panel hms-form-panel"><div className="hms-panel-heading"><div><span className="hms-eyebrow">NEW ACCOUNT</span><h3>Provision portal access</h3><p>Credentials are generated securely. The temporary password is displayed only once.</p></div></div>
   <form className="hms-data-form" onSubmit={submit}>
    <label>Account type<select value={role} onChange={e=>setRole(e.target.value as "receptionist"|"staff")}><option value="receptionist">Individual Receptionist</option><option value="staff">Shared Staff Portal</option></select></label>
    <label>Full name / account label<input required value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Person's full name or Staff Portal"/></label>
    <label>Username<input required minLength={3} maxLength={32} pattern="[a-z0-9][a-z0-9._-]{2,31}" value={username} onChange={e=>setUsername(e.target.value.toLowerCase())} placeholder={role==="staff"?"staff":"e.g. reception.jane"}/></label>
    <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Verified email address"/></label>
    <label>Phone number<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+234..."/></label>
    <label className="hms-account-check"><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/> I have verified this person&apos;s identity and contact details before issuing access.</label>
    {role==="staff"&&staffExists&&<p className="hms-account-warning">The shared Staff Portal account already exists. Do not create a second shared login.</p>}
    <div className="hms-form-actions"><button type="submit" className="hms-primary" disabled={busy||(role==="staff"&&staffExists)}>{busy?"Creating account…":"Create account & generate temporary password →"}</button></div>
   </form>
  </section>
  <section className="hms-panel hms-table-panel"><div className="hms-panel-heading"><div><h3>Existing portal accounts</h3><p>{loading?"Loading accounts…":accounts.length+" account(s) registered"}</p></div><button className="hms-filter" type="button" onClick={()=>void refresh()}>↻ Refresh</button></div>
   {accounts.length===0&&!loading?<div className="hms-account-empty">No portal accounts have been provisioned yet.</div>:<div className="hms-table-wrap"><table className="hms-table"><thead><tr><th>NAME</th><th>USERNAME</th><th>ROLE</th><th>CONTACT</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{accounts.map(a=><tr key={a.id}><td>{a.display_name}</td><td>{a.login_username??"—"}</td><td>{a.role}</td><td>{a.email??a.phone??"—"}</td><td>{!a.is_active?"Suspended":a.must_change_password?"Password change required":"Active"}</td><td>{a.role!=="admin"&&<div className="hms-account-actions"><button type="button" onClick={()=>void manage(a.id,"reset_password")}>Reset password</button><button type="button" onClick={()=>void manage(a.id,a.is_active?"suspend":"reactivate")}>{a.is_active?"Suspend":"Reactivate"}</button></div>}</td></tr>)}</tbody></table></div>}
  </section>
  <p className="hms-data-note">Security: passwords are managed by Supabase Auth and are never stored in the HMS profile table. Admin account creation is audited. Shared Staff access does not prove which individual staff member performed an action.</p>
 </div>;
}