import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";
export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("user_profiles")
    .select("is_active,must_change_password").eq("auth_user_id", user.id).maybeSingle();
  if (!profile?.is_active) { await supabase.auth.signOut(); redirect("/login"); }
  if (!profile.must_change_password) redirect("/login");
  return <main className="portal-lock-page"><section className="portal-lock-card">
    <div className="portal-lock-toolbar"><ThemeToggle/></div>
    <Link href="/" className="portal-lock-brand"><span className="portal-lock-mark">S</span><span><b>SAMZY HMS</b><small>SECURE HOSPITAL OPERATIONS</small></span></Link>
    <div className="portal-lock-status"><span/> PASSWORD UPDATE REQUIRED</div>
    <h1>Create your password</h1>
    <p className="portal-lock-lead">Your temporary password has been accepted. Set a private password of at least 12 characters before entering the portal.</p>
    <PasswordChangeForm/>
  </section></main>;
}