import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="portal-lock-page">
      <section className="portal-lock-card">
        <Link href="/" className="portal-lock-brand">
          <span className="portal-lock-mark">S</span>
          <span><b>SAMZY HMS</b><small>SECURE HOSPITAL OPERATIONS</small></span>
        </Link>
        <div className="portal-lock-status"><span /> AUTHENTICATED ACCESS ONLY</div>
        <h1>Sign in</h1>
        <p className="portal-lock-lead">Use the credentials issued by your hospital administrator. Your role and hospital access are verified on the server.</p>
        <LoginForm />
      </section>
    </main>
  );
}
