"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const messageUrl = (path: string, kind: "error" | "message", message: string) => `${path}?${kind}=${encodeURIComponent(message)}`;

export async function signInAction(form: FormData) {
  const email = value(form, "email"); const password = value(form, "password");
  if (!email || !password) redirect(messageUrl("/login", "error", "Email and password are required."));
  const { error } = await (await createClient()).auth.signInWithPassword({ email, password });
  if (error) redirect(messageUrl("/login", "error", error.message));
  redirect("/");
}

export async function signUpAction(form: FormData) {
  const displayName = value(form, "display_name"); const email = value(form, "email"); const password = value(form, "password");
  if (displayName.length < 2 || displayName.length > 100) redirect(messageUrl("/signup", "error", "Name must be 2–100 characters."));
  if (password.length < 8) redirect(messageUrl("/signup", "error", "Password must be at least 8 characters."));
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await (await createClient()).auth.signUp({ email, password, options: { data: { display_name: displayName }, emailRedirectTo: `${origin}/auth/callback` } });
  if (error) redirect(messageUrl("/signup", "error", error.message));
  if (data.session) redirect("/");
  redirect(messageUrl("/login", "message", "Check your email to confirm your account, then sign in."));
}

export async function signOutAction() {
  await (await createClient()).auth.signOut();
  redirect("/login");
}

