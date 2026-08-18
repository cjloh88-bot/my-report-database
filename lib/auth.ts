import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "engineer" | "manager" | "admin";
export type CurrentProfile = { id: string; display_name: string; role: UserRole };

export async function getCurrentUser() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await (await createClient()).from("profiles").select("id,display_name,role").eq("id", user.id).maybeSingle();
  if (error || !data) return { id: user.id, display_name: String(user.user_metadata?.display_name || user.email?.split("@")[0] || "User"), role: "engineer" };
  return data as CurrentProfile;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(role: UserRole) {
  const profile = await requireProfile();
  if (profile.role !== role) throw new Error(`${role[0].toUpperCase()}${role.slice(1)} access required.`);
  return profile;
}

export async function requireAnyRole(...roles: UserRole[]) {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) throw new Error("You do not have access to this action.");
  return profile;
}
