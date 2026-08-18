import Link from "next/link";
import { signInAction } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const query = await searchParams;
  return <section className="auth-page"><div className="auth-card"><div className="auth-brand"><span className="brand-mark">R</span><div><strong>ReportBase</strong><small>Engineering control room</small></div></div><p className="eyebrow">SECURE ACCESS</p><h1>Welcome back</h1><p>Sign in to submit reports or make review decisions.</p>{query.error && <div className="form-message error-message" role="alert">{query.error}</div>}{query.message && <div className="form-message success-message" role="status">{query.message}</div>}<form action={signInAction} className="form-stack"><label>Email<input type="email" name="email" autoComplete="email" required/></label><label>Password<input type="password" name="password" autoComplete="current-password" minLength={8} required/></label><SubmitButton>Sign in</SubmitButton></form><p className="auth-switch">New to ReportBase? <Link href="/signup">Create an engineer account</Link></p></div></section>;
}

