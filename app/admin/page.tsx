import { requireRole } from "@/lib/auth";
import { listManagedUsers } from "@/lib/data/users";
import { inviteUserAction, setUserRoleAction, setUserSuspendedAction, deleteUserAction } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { AdminDeleteButton } from "@/components/admin-delete-button";
export const dynamic = "force-dynamic";

const suspended = (date: string | null) => Boolean(date && new Date(date).getTime() > Date.now());

export default async function AdminPage() {
  const actor = await requireRole("admin"); const users = await listManagedUsers();
  return <><header className="page-header"><div><p className="eyebrow">ADMINISTRATION</p><h1>User access</h1><p>Invite people, assign access levels, suspend access, or remove accounts.</p></div><span className="queue-count">{users.length}<small>users</small></span></header>
    <section className="split-layout"><div className="panel"><div className="section-heading"><div><h2>People and access</h2><p>Role and account state are enforced on the server.</p></div></div><div className="user-table">{users.map(user => { const isSelf = user.id === actor.id; const isSuspended = suspended(user.bannedUntil); return <article key={user.id}><div className="user-identity"><span className="avatar">{user.displayName.slice(0,1).toUpperCase()}</span><div><strong>{user.displayName}{isSelf && " (you)"}</strong><span>{user.email}</span><small>{user.confirmed ? "Confirmed" : "Invite pending"} · {user.lastSignInAt ? `Last active ${new Date(user.lastSignInAt).toLocaleDateString()}` : "Never signed in"}</small></div></div><form action={setUserRoleAction} className="role-form"><input type="hidden" name="user_id" value={user.id}/><select name="role" defaultValue={user.role} disabled={isSelf}><option value="engineer">Engineer</option><option value="manager">Manager</option><option value="admin">Administrator</option></select>{!isSelf && <SubmitButton className="small-button">Save</SubmitButton>}</form><div className="user-actions">{!isSelf && <form action={setUserSuspendedAction}><input type="hidden" name="user_id" value={user.id}/><input type="hidden" name="suspend" value={String(!isSuspended)}/><button type="submit">{isSuspended ? "Restore" : "Suspend"}</button></form>}{!isSelf && <form action={deleteUserAction}><input type="hidden" name="user_id" value={user.id}/><AdminDeleteButton/></form>} {isSuspended && <span className="badge badge-returned">suspended</span>}</div></article>})}</div></div>
      <aside className="panel form-panel"><p className="eyebrow">INVITE USER</p><h2>Add a person</h2><p className="muted">They receive a secure email link to set up access. Administrators never handle passwords.</p><form action={inviteUserAction} className="form-stack"><label>Full name<input name="display_name" minLength={2} maxLength={100} required/></label><label>Email<input name="email" type="email" required/></label><label>Access level<select name="role" defaultValue="engineer"><option value="engineer">Engineer — own reports</option><option value="manager">Manager — review reports</option><option value="admin">Administrator — full control</option></select></label><SubmitButton>Send invitation</SubmitButton></form></aside>
    </section></>;
}

