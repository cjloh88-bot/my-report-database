"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole, type CurrentProfile, type UserRole } from "@/lib/auth";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const allowedRoles: UserRole[] = ["engineer", "manager", "admin"];
const roleValue = (form: FormData) => { const role = text(form, "role") as UserRole; if (!allowedRoles.includes(role)) throw new Error("Invalid access level."); return role; };

async function writeAdminAudit(actor: CurrentProfile, action: string, targetId: string, detail: Record<string, unknown>) {
  const { error } = await createAdminClient().from("audit_logs").insert({ actor_id: actor.id, actor_name: actor.display_name, action, target_type: "users", target_id: targetId, detail });
  if (error) throw error;
}

async function ensureNotFinalAdmin(targetId: string, replacementRole?: UserRole) {
  const admin = createAdminClient();
  const { data: target, error } = await admin.from("profiles").select("role").eq("id", targetId).single();
  if (error) throw error;
  if (target.role === "admin" && replacementRole !== "admin") {
    const { count, error: countError } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
    if (countError) throw countError;
    if ((count ?? 0) <= 1) throw new Error("The final administrator cannot be removed or demoted.");
  }
}

export async function inviteUserAction(form: FormData) {
  const actor = await requireRole("admin"); const admin = createAdminClient();
  const email = text(form, "email").toLowerCase(); const displayName = text(form, "display_name"); const role = roleValue(form);
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("A valid email is required.");
  if (displayName.length < 2 || displayName.length > 100) throw new Error("Name must be 2–100 characters.");
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { display_name: displayName }, redirectTo: `${origin}/auth/callback` });
  if (error) throw error;
  const { error: profileError } = await admin.from("profiles").update({ display_name: displayName, role }).eq("id", data.user.id);
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw profileError;
  }
  await writeAdminAudit(actor, "invite", data.user.id, { email, display_name: displayName, role });
  revalidatePath("/admin"); revalidatePath("/activity");
}

export async function setUserRoleAction(form: FormData) {
  const actor = await requireRole("admin"); const targetId = text(form, "user_id"); const role = roleValue(form);
  if (!targetId) throw new Error("User is required.");
  if (targetId === actor.id && role !== "admin") throw new Error("You cannot demote your own administrator account.");
  await ensureNotFinalAdmin(targetId, role);
  const admin = createAdminClient();
  const { data: before, error: readError } = await admin.from("profiles").select("role").eq("id", targetId).single();
  if (readError) throw readError;
  const { error } = await admin.from("profiles").update({ role }).eq("id", targetId); if (error) throw error;
  await writeAdminAudit(actor, "role_change", targetId, { before: before.role, after: role });
  revalidatePath("/admin"); revalidatePath("/activity");
}

export async function setUserSuspendedAction(form: FormData) {
  const actor = await requireRole("admin"); const targetId = text(form, "user_id"); const suspend = text(form, "suspend") === "true";
  if (!targetId) throw new Error("User is required.");
  if (targetId === actor.id && suspend) throw new Error("You cannot suspend your own account.");
  const { error } = await createAdminClient().auth.admin.updateUserById(targetId, { ban_duration: suspend ? "876000h" : "none" });
  if (error) throw error;
  await writeAdminAudit(actor, suspend ? "suspend" : "restore", targetId, { suspended: suspend });
  revalidatePath("/admin"); revalidatePath("/activity");
}

export async function deleteUserAction(form: FormData) {
  const actor = await requireRole("admin"); const targetId = text(form, "user_id");
  if (!targetId) throw new Error("User is required.");
  if (targetId === actor.id) throw new Error("You cannot delete your own administrator account.");
  await ensureNotFinalAdmin(targetId);
  const admin = createAdminClient(); const { data: userData } = await admin.auth.admin.getUserById(targetId);
  await writeAdminAudit(actor, "user_delete", targetId, { email: userData.user?.email || "unknown" });
  const { error } = await admin.auth.admin.deleteUser(targetId); if (error) throw error;
  revalidatePath("/admin"); revalidatePath("/activity");
}
