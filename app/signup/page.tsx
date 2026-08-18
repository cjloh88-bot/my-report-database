import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return <section className="auth-page"><div className="auth-card"><div className="auth-brand"><span className="brand-mark">R</span><div><strong>ReportBase</strong><small>Engineering control room</small></div></div><p className="eyebrow">ENGINEER SIGNUP</p><h1>Create your account</h1><p>New accounts start as engineers. Manager access requires administrator approval.</p>{query.error && <div className="form-message error-message" role="alert">{query.error}</div>}<form action={signUpAction} className="form-stack"><label>Full name<input name="display_name" autoComplete="name" minLength={2} maxLength={100} required/></label><label>Email<input type="email" name="email" autoComplete="email" required/></label><label>Password<input type="password" name="password" autoComplete="new-password" minLength={8} required/></label><SubmitButton>Create account</SubmitButton></form><p className="auth-switch">Already registered? <Link href="/login">Sign in</Link></p></div></section>;
}

