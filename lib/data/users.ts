import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth";

export type ManagedUser = { id: string; email: string; displayName: string; role: UserRole; createdAt: string; lastSignInAt: string | null; bannedUntil: string | null; confirmed: boolean };

export async function listManagedUsers() {
  const admin = createAdminClient();
  const [{ data: authData, error: authError }, { data: profiles, error: profileError }] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from("profiles").select("id,display_name,role"),
  ]);
  if (authError) throw authError; if (profileError) throw profileError;
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
  return authData.users.map((user: User) => { const profile = profileMap.get(user.id); return { id: user.id, email: user.email ?? "No email", displayName: profile?.display_name || String(user.user_metadata?.display_name || "User"), role: (profile?.role || "engineer") as UserRole, createdAt: user.created_at, lastSignInAt: user.last_sign_in_at ?? null, bannedUntil: user.banned_until ?? null, confirmed: Boolean(user.email_confirmed_at) } satisfies ManagedUser; });
}

