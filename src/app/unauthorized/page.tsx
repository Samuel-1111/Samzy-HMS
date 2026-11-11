import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="portal-lock-page">
      <section className="portal-lock-card">
        <div className="portal-lock-status"><span /> ACCESS RESTRICTED</div>
        <h1>You do not have access to this portal.</h1>
        <p className="portal-lock-lead">Your account does not have the required hospital role, or its access is not active.</p>
        <Link href="/login" className="portal-lock-home">Return to secure sign in</Link>
      </section>
    </main>
  );
}
