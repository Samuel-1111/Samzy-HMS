"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {signOut} from "@/app/actions";
import {ThemeToggle} from "@/components/ThemeToggle";
type Kind="admin"|"reception"|"staff"|"patient";
type Mod={id:string;label:string;icon:string;description:string;group:string;actions?:string[]};
const admin:Mod[]=[
{id:"overview",label:"Dashboard",icon:"⌂",description:"Hospital-wide operational overview and service indicators.",group:"Overview"},
{id:"patients",label:"Patients",icon:"♙",description:"Registration, identity, demographics, next of kin and patient profiles.",group:"Clinical Operations",actions:["Register patient","Find patient"]},
{id:"appointments",label:"Appointments",icon:"▦",description:"Review requests, approve, reschedule, decline and manage arrivals.",group:"Clinical Operations",actions:["Review requests","Schedule appointment"]},
{id:"departments",label:"Departments",icon:"▤",description:"Create and manage departments used throughout the system.",group:"Clinical Operations",actions:["Add department"]},
{id:"staff",label:"Staff Directory",icon:"♧",description:"Manage staff directory, roles, assignments and account access.",group:"Administration",actions:["Add staff member"]},
{id:"queues",label:"Patient Queues",icon:"☷",description:"Monitor live department queues and patient movement.",group:"Clinical Operations"},
{id:"records",label:"Medical Records",icon:"▣",description:"Access authorised clinical records, encounters and amendments.",group:"Clinical Operations"},
{id:"referrals",label:"Referrals",icon:"↗",description:"Create, route, receive and track department referrals.",group:"Clinical Operations"},
{id:"admissions",label:"Admissions & Wards",icon:"▥",description:"Manage admissions, ward allocation, beds and discharge.",group:"Clinical Operations",actions:["New admission"]},
{id:"laboratory",label:"Laboratory",icon:"⚗",description:"Lab requests, specimen collection, processing and released results.",group:"Clinical Operations"},
{id:"pharmacy",label:"Pharmacy",icon:"✚",description:"Prescriptions, dispensing, stock and medication workflows.",group:"Clinical Operations"},
{id:"radiology",label:"Radiology",icon:"◉",description:"Imaging requests, examinations, reports and result release.",group:"Clinical Operations"},
{id:"billing",label:"Billing & Accounts",icon:"₦",description:"Invoices, payments, receipts, balances and reconciliation.",group:"Administration"},
{id:"insurance",label:"Insurance / NHIA / HMO",icon:"◇",description:"Payers, eligibility, coverage, claims and authorisations.",group:"Administration"},
{id:"inventory",label:"Inventory",icon:"▦",description:"Medical supplies, stock movements, reorder levels and suppliers.",group:"Administration"},
{id:"messages",label:"Patient Messages",icon:"✉",description:"Reception-only conversations with patients.",group:"Security & Communication"},
{id:"cctv",label:"CCTV Monitoring",icon:"◉",description:"Integration readiness and permission-controlled camera access.",group:"Security & Communication"},
{id:"notifications",label:"Notifications",icon:"♢",description:"System alerts, delivery status and preferences.",group:"Security & Communication"},
{id:"reports",label:"Reports & Analytics",icon:"▥",description:"Operational, clinical and financial reports from authorised data.",group:"Administration"},
{id:"audit",label:"Audit Logs",icon:"≋",description:"Review security events, access history and record-change trails.",group:"Security & Communication"},
{id:"settings",label:"Settings",icon:"⚙",description:"Hospital profile, access policies and workflow configuration.",group:"Configuration"}
];
const reception:Mod[]=[
{id:"overview",label:"Reception Overview",icon:"⌂",description:"Front-desk activity, arrivals and pending work.",group:"Overview"},
{id:"patients",label:"Patient Search & Registration",icon:"♙",description:"Find existing patients or register a new patient with duplicate checks.",group:"Front Desk",actions:["Register patient","Search patient"]},
{id:"appointments",label:"Appointments",icon:"▦",description:"Review requests, confirm appointments and record arrivals.",group:"Front Desk",actions:["Review requests","New appointment"]},
{id:"checkin",label:"Check-in & Queue",icon:"☷",description:"Check in walk-ins and appointments and route patients to departments.",group:"Front Desk",actions:["Check in patient"]},
{id:"admissions",label:"Admissions & Discharge",icon:"▥",description:"Coordinate admission requests, ward placement and discharge.",group:"Patient Flow"},
{id:"referrals",label:"Referrals",icon:"↗",description:"Create and track referrals between configured departments.",group:"Patient Flow"},
{id:"insurance",label:"Insurance & NHIA",icon:"◇",description:"Verify payer type, NHIA/NHIS or HMO cover and eligibility.",group:"Payments"},
{id:"billing",label:"Invoices & Payments",icon:"₦",description:"View charges, authorised payment activity and balances.",group:"Payments"},
{id:"messages",label:"Patient Messages",icon:"✉",description:"Reception-only patient inbox. Clinical staff cannot access it.",group:"Communication"},
{id:"departments",label:"Departments",icon:"▤",description:"View departments configured by Admin.",group:"Reference"}
];
const staff:Mod[]=[
{id:"overview",label:"Staff Workspace",icon:"⌂",description:"Shared staff workspace and department activity.",group:"Workspace"},
{id:"patients",label:"Patient Directory",icon:"♙",description:"Search the hospital patient directory and open authorised profiles.",group:"Clinical Work",actions:["Find patient"]},
{id:"records",label:"Clinical Records",icon:"▣",description:"Add entries with manually entered author name and Admin-managed department.",group:"Clinical Work",actions:["Add clinical entry"]},
{id:"queues",label:"Department Queues",icon:"☷",description:"View patients waiting for your department and update service stages.",group:"Clinical Work"},
{id:"referrals",label:"Referrals",icon:"↗",description:"Create a referral or confirm arrival from another department.",group:"Clinical Work"},
{id:"laboratory",label:"Laboratory Requests",icon:"⚗",description:"View authorised requests and update laboratory workflow.",group:"Clinical Work"},
{id:"radiology",label:"Radiology Requests",icon:"◉",description:"View imaging requests and authorised reports.",group:"Clinical Work"},
{id:"prescriptions",label:"Prescriptions",icon:"✚",description:"Review prescriptions where authorised.",group:"Clinical Work"},
{id:"notifications",label:"Notifications",icon:"♢",description:"Service updates and system notifications.",group:"Workspace"}
];
const patient:Mod[]=[
{id:"overview",label:"My Dashboard",icon:"⌂",description:"Your appointments, care updates and important notices.",group:"My Care"},
{id:"profile",label:"My Profile",icon:"♙",description:"Review personal details and emergency contact information.",group:"My Care"},
{id:"appointments",label:"Appointments",icon:"▦",description:"Request, view and track appointments.",group:"My Care",actions:["Request appointment"]},
{id:"records",label:"Medical History",icon:"▣",description:"View records authorised for release to your account.",group:"My Health"},
{id:"prescriptions",label:"Prescriptions",icon:"✚",description:"Review prescriptions released to your patient account.",group:"My Health"},
{id:"results",label:"Lab & Radiology Results",icon:"⚗",description:"View results after the responsible team releases them.",group:"My Health"},
{id:"invoices",label:"Invoices & Payments",icon:"₦",description:"Review invoices, payment history and balances.",group:"My Account"},
{id:"admissions",label:"Admissions",icon:"▥",description:"View admission and discharge information.",group:"My Care"},
{id:"referrals",label:"Referrals & Follow-ups",icon:"↗",description:"Track referrals and follow-up instructions.",group:"My Care"},
{id:"messages",label:"Message Reception",icon:"✉",description:"Contact Reception for administrative assistance.",group:"Communication",actions:["New message"]},
{id:"notifications",label:"Notifications",icon:"♢",description:"Appointment reminders and hospital updates.",group:"Communication"}
];
const sets:Record<Kind,Mod[]>={admin,reception,staff,patient};
const role:Record<Kind,string>={admin:"Administrator",reception:"Receptionist",staff:"Staff workspace",patient:"Patient"};
const statLabels:Record<Kind,string[]>={admin:["TOTAL PATIENTS","TODAY'S VISITS","PENDING APPOINTMENTS","ACTIVE ADMISSIONS"],reception:["TODAY'S ARRIVALS","PENDING REQUESTS","WAITING PATIENTS","UNREAD MESSAGES"],staff:["PATIENTS IN QUEUE","MY DEPARTMENT","PENDING REFERRALS","NEW NOTIFICATIONS"],patient:["UPCOMING APPOINTMENTS","RELEASED RESULTS","OPEN INVOICES","UNREAD MESSAGES"]};
function Empty({title,desc}:{title:string;desc:string}){return <div className="hms-empty"><span className="hms-empty-icon">▤</span><h3>No records to display</h3><p>{desc}</p><small>{title} appears here when genuine hospital records are available.</small></div>}
export function PortalWorkspace({kind,displayName}:{kind:Kind;displayName:string}){
 const modules=sets[kind],[active,setActive]=useState("overview"),[query,setQuery]=useState(""),[mobile,setMobile]=useState(false),[notice,setNotice]=useState("");
 const current=modules.find(m=>m.id===active)||modules[0],groups=useMemo(()=>Array.from(new Set(modules.map(m=>m.group))),[modules]),filtered=modules.filter(m=>(m.label+" "+m.description).toLowerCase().includes(query.toLowerCase()));
 const initials=displayName.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join("")||"U";
 function open(id:string){setActive(id);setMobile(false);setNotice("");}
 return <div className="hms-app">
 <aside className={"hms-sidebar "+(mobile?"is-open":"")}>
 <Link href="/" className="hms-brand"><span className="hms-brand-mark">S</span><span><b>SAMZY HMS</b><small>HOSPITAL OPERATIONS</small></span></Link>
 <div className="hms-workspace-label">WORKSPACE</div><div className="hms-workspace-card"><span className="hms-hospital-icon">✚</span><span><b>Hospital Workspace</b><small>{role[kind]} access</small></span><i>⌄</i></div>
 <label className="hms-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search menu..." aria-label="Search menu"/><kbd>⌘ K</kbd></label>
 <nav className="hms-nav">{groups.map(group=><section key={group}><div className="hms-nav-group">{group}</div>{filtered.filter(m=>m.group===group).map(m=><button key={m.id} className={active===m.id?"active":""} onClick={()=>open(m.id)}><span>{m.icon}</span>{m.label}{active===m.id&&<i>›</i>}</button>)}</section>)}{filtered.length===0&&<p className="hms-no-results">No menu items match.</p>}</nav>
 <div className="hms-sidebar-bottom"><div className="hms-secure"><span>◈</span><div><b>Secure workspace</b><small>Role-based access enabled</small></div></div><form action={signOut}><button className="hms-signout" type="submit">↪ &nbsp;Sign out securely</button></form><small className="hms-version">SAMZY HMS · BUILT BY SAMZY TECHNOLOGY</small></div>
 </aside>{mobile&&<button className="hms-scrim" aria-label="Close menu" onClick={()=>setMobile(false)}/>}
 <main className="hms-main"><header className="hms-topbar"><div className="hms-topbar-left"><button className="hms-mobile-menu" onClick={()=>setMobile(!mobile)} aria-label="Toggle menu">☰</button><div><div className="hms-breadcrumb">HOSPITAL WORKSPACE <span>/</span> {role[kind].toUpperCase()}</div><h1>{current.label}</h1></div></div><div className="hms-top-actions"><span className="hms-live-status"><i/> SYSTEM ONLINE</span><ThemeToggle/><button className="hms-notification" aria-label="Notifications" onClick={()=>open(modules.some(m=>m.id==="notifications")?"notifications":"overview")}>♢</button><div className="hms-user"><span className="hms-avatar">{initials}</span><span><b>{displayName}</b><small>{role[kind]}</small></span></div></div></header>
 <div className="hms-content"><div className="hms-welcome"><div><span className="hms-eyebrow">SAMZY HMS · {role[kind].toUpperCase()}</span><h2>{active==="overview"?(kind==="admin"?"Hospital overview":kind==="reception"?"Front desk overview":kind==="staff"?"Your clinical workspace":"Your care at a glance"):current.label}</h2><p>Welcome back, {displayName}. {current.description}</p></div><div className="hms-date-chip"><span>◷</span><div><b>{new Date().toLocaleDateString("en-NG",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</b><small>LOCAL HOSPITAL TIME</small></div></div></div>
 {notice&&<div className="hms-notice" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
 {active==="overview"?<Overview kind={kind} modules={modules} open={open}/>:<ModulePage kind={kind} module={current} notice={setNotice}/>}
 <footer className="hms-footer"><span>© {new Date().getFullYear()} Samzy HMS</span><span>Secure hospital operations · Built by Samzy Technology</span><span>Activity subject to access permissions and audit policy.</span></footer></div></main></div>;
}
function Overview({kind,modules,open}:{kind:Kind;modules:Mod[];open:(id:string)=>void}){
 const values=statLabels[kind],shortcuts=modules.filter(m=>m.id!=="overview").slice(0,6);
 return <div className="hms-overview"><section className="hms-stat-grid">{values.map((v,i)=><article className="hms-stat" key={v}><div className="hms-stat-top"><span>{v}</span><i>{["▤","◷","♙","✉"][i]}</i></div><b>{kind==="staff"&&i===1?"Not set":"0"}</b><small>{kind==="staff"&&i===1?"Awaiting assignment":"No records yet"}</small></article>)}</section>
 <section className="hms-panel-grid"><article className="hms-panel"><div className="hms-panel-heading"><div><span className="hms-eyebrow">LIVE OPERATIONS</span><h3>Recent activity</h3><p>Live information will appear here as authorised records are created.</p></div><span className="hms-neutral-tag">NO ACTIVITY</span></div><Empty title="Activity feed" desc="There is currently no operational activity in this workspace."/></article>
 <article className="hms-panel"><div className="hms-panel-heading"><div><span className="hms-eyebrow">QUICK ACCESS</span><h3>Workspace modules</h3><p>Open a section to get started.</p></div></div><div className="hms-shortcuts">{shortcuts.map(m=><button key={m.id} onClick={()=>open(m.id)}><span>{m.icon}</span><b>{m.label}</b><i>→</i></button>)}</div></article></section>
 {kind==="admin"&&<section className="hms-panel"><div className="hms-panel-heading"><div><span className="hms-eyebrow">SYSTEM READINESS</span><h3>Hospital setup checklist</h3><p>Complete configuration before enabling live operations.</p></div><span className="hms-neutral-tag">NOT CONFIGURED</span></div><div className="hms-checklist">{["Create hospital workspace and profile","Configure departments, wards and service locations","Provision individual Admin and Receptionist accounts","Provision the single shared Staff Portal account","Configure patient access and temporary credentials","Verify permissions, tenant isolation and audit trails","Complete clinical workflow acceptance testing","Configure approved CCTV/NVR integration if required"].map((v,i)=><div key={v}><span>{i+1}</span><b>{v}</b><small>Pending</small></div>)}</div></section>}
 <p className="hms-data-note">ⓘ &nbsp;No seeded or demonstration patient data. Metrics remain at zero until genuine hospital records are created.</p></div>;
}
function ModulePage({kind,module,notice}:{kind:Kind;module:Mod;notice:(s:string)=>void}){
 const [term,setTerm]=useState(""),isCctv=module.id==="cctv",isSettings=module.id==="settings",isMessages=module.id==="messages",isStaffRecords=kind==="staff"&&module.id==="records";
 return <div className="hms-module-page"><section className="hms-module-intro"><div><span className="hms-eyebrow">{module.group.toUpperCase()}</span><h2>{module.label}</h2><p>{module.description}</p></div><span className="hms-module-icon">{module.icon}</span></section>
 {isCctv?<section className="hms-panel"><div className="hms-panel-heading"><div><h3>CCTV connection not configured</h3><p>No camera streams are connected to this workspace.</p></div><span className="hms-neutral-tag">OFFLINE</span></div><div className="hms-cctv-placeholder"><span>◉</span><b>No camera feeds available</b><small>Connect only an authorised hospital NVR/VMS through a secure supported integration.</small></div><div className="hms-warning">Requires approved camera inventory, access permissions, audit logging, secure streaming gateway and hospital privacy review. No cameras in private spaces.</div></section>
 :isSettings?<section className="hms-panel"><div className="hms-panel-heading"><div><h3>Workspace configuration</h3><p>Options become available after hospital provisioning.</p></div></div><div className="hms-settings-grid">{["Hospital profile","Departments & services","User access & roles","Patient ID settings","Notifications","Security & audit","Clinical workflows","Data retention & privacy","Backup & recovery","Appearance"].map((v,i)=><button key={v} onClick={()=>notice(v+": hospital setup is required before this setting can be changed.")}><span>{["✚","▤","♙","▣","♢","◈","☷","⌑","⟳","◐"][i]}</span><b>{v}</b><small>Configure workspace</small><i>→</i></button>)}</div></section>
 :<><section className="hms-toolbar"><label><span>⌕</span><input value={term} onChange={e=>setTerm(e.target.value)} placeholder={"Search "+module.label.toLowerCase()+"..."}/></label><div><button className="hms-filter" onClick={()=>notice("Filters will be available when authorised live records are connected.")}>☷ Filters</button>{module.actions?.map(a=><button key={a} className="hms-primary" onClick={()=>notice(a+": the interface is prepared. Live record creation requires the hospital workspace and server-side workflow configuration.")}>＋ {a}</button>)}</div></section>
 {isMessages&&<div className="hms-info-banner">ⓘ &nbsp;Patient messaging is restricted to Reception and the patient. Clinical Staff accounts do not have access to this inbox.</div>}
 {isStaffRecords&&<div className="hms-info-banner">ⓘ &nbsp;Staff use one shared portal login. Author name is entered manually and is not independently verified. Department selection must come from the Admin-managed list.</div>}
 <section className="hms-panel hms-table-panel"><div className="hms-panel-heading"><div><h3>{module.label}</h3><p>{term?"No matching records for this search.":"Records will be listed here when available."}</p></div><span className="hms-neutral-tag">0 RECORDS</span></div><div className="hms-table-wrap"><table className="hms-table"><thead><tr>{(isStaffRecords?["PATIENT","RECORD TYPE","DEPARTMENT","AUTHOR","DATE","STATUS"]:isMessages?["PATIENT","SUBJECT","LAST MESSAGE","UPDATED","STATUS","ACTION"]:module.id==="patients"?["PATIENT","PATIENT ID","PHONE","PAYER","STATUS","ACTION"]:["REFERENCE","NAME / DESCRIPTION","CATEGORY","CREATED","STATUS","ACTION"]).map(v=><th key={v}>{v}</th>)}</tr></thead><tbody><tr><td colSpan={6}><Empty title={module.label} desc={term?"No records match your search.":"No records have been created in this section yet."}/></td></tr></tbody></table></div></section></>}
 <p className="hms-data-note">ⓘ &nbsp;No sample records are shown. Information in this module must come from authorised hospital data.</p></div>;
}