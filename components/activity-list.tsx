import type { AuditLog } from "@/lib/data/audit";

const labels: Record<string, string> = { projects: "project", stages: "stage", reports: "report", report_revisions: "revision", review_comments: "review comment", users: "user account" };
const record = (value: unknown) => value && typeof value === "object" ? value as Record<string, unknown> : {};
function eventSummary(log: AuditLog) {
  const before = record(log.detail.before); const after = record(log.detail.after); const row = Object.keys(after).length ? after : before;
  if (log.target_type === "reports" && before.status && after.status && before.status !== after.status) return `${String(before.status).replaceAll("_", " ")} → ${String(after.status).replaceAll("_", " ")}`;
  if (log.target_type === "review_comments") return `${String(row.action || "comment")}: ${String(row.comment_text || "").slice(0, 120)}`;
  if (log.target_type === "report_revisions") return String(row.change_summary || `Revision ${row.revision_number || ""}`);
  if (log.target_type === "users") return String(log.detail.email || log.detail.after || log.detail.role || "Access changed");
  return String(row.title || row.name || row.change_summary || "Record changed");
}
export function ActivityList({ logs }: { logs: AuditLog[] }) {
  if (!logs.length) return <div className="empty"><h3>No activity yet</h3><p>New changes will be recorded here automatically.</p></div>;
  return <div className="activity-list">{logs.map(log => <article key={log.id}><span className={`activity-icon action-${log.action}`}>{log.action.slice(0,1).toUpperCase()}</span><div><strong>{log.actor_name}</strong> {log.action}d a {labels[log.target_type] || log.target_type}<p className="activity-summary">{eventSummary(log)}</p><p>{new Date(log.created_at).toLocaleString()} · <code>{log.target_id || "deleted record"}</code></p></div></article>)}</div>;
}
