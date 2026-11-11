import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  return (
    <main className="portal-lock-page">
      <section className="portal-lock-card">
        <div className="portal-lock-toolbar"><ThemeToggle /></div>
        <Link href="/" className="portal-lock-brand">
          <span className="portal-lock-mark">S</span>
          <span><b>SAMZY HMS</b><small>SECURE HOSPITAL OPERATIONS</small></span>
        </Link>
        <div className="portal-lock-status"><span /> AUTHENTICATED ACCESS ONLY</div>
        <h1>Administrator Portal</h1>
        <p className="portal-lock-lead">Sign in with the Administrator username and password configured in your Vercel environment variables.</p>
        <LoginForm />
      </section>
    </main>
  );
}
