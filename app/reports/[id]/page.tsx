import Link from "next/link";
import { notFound } from "next/navigation";
import { getReport } from "@/lib/data/reports";
import { getProject } from "@/lib/data/projects";
import { listStages } from "@/lib/data/stages";
import { listComments } from "@/lib/data/comments";
import { listRevisions } from "@/lib/data/revisions";
import { approveReportAction, deleteReportAction, editReportAction, returnReportAction, startReviewAction, submitReportAction } from "@/app/actions";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import { RevisionList } from "@/components/revision-list";
export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const report = await getReport(id); if (!report) notFound();
  const [project, stages, comments, revisions] = await Promise.all([getProject(report.project_id), listStages(report.project_id), listComments(id), listRevisions(id)]);
  const stage = stages.find(s => s.id === report.stage_id); const editable = report.status === "draft" || report.status === "returned";
  return <><div className="breadcrumb"><Link href="/reports">Reports</Link><span>/</span><Link href={`/projects/${report.project_id}`}>{project?.name}</Link><span>/</span><span>{stage?.name}</span></div>
    <header className="report-heading"><div><div className="row"><StatusBadge status={report.status}/><span className="muted small">{stage?.name}</span></div><h1>{report.title}</h1><p>Submitted by <strong>{report.submitted_by_name || "Unassigned"}</strong>{report.due_date ? ` · Due ${new Date(`${report.due_date}T00:00:00`).toLocaleDateString()}` : ""}</p></div><div className="header-actions">{report.status === "draft" && <form action={submitReportAction}><input type="hidden" name="id" value={id}/><SubmitButton>Submit for review</SubmitButton></form>}{report.status === "submitted" && <form action={startReviewAction}><input type="hidden" name="id" value={id}/><SubmitButton>Start review</SubmitButton></form>}</div></header>
    {report.status === "returned" && <div className="notice returned-notice"><strong>Revision requested.</strong><span>Edit this report below. Saving creates a new revision and returns it to draft, ready to resubmit.</span></div>}
    {report.status === "approved" && <div className="notice approved-notice"><strong>Approved by {report.reviewed_by_name}</strong><span>{report.reviewed_at && new Date(report.reviewed_at).toLocaleString()} · This decision is final.</span></div>}
    <div className="report-layout"><div className="main-column"><section className="panel report-content"><div className="section-heading"><p className="eyebrow">REPORT CONTENT</p>{editable && <a href="#edit-report">Edit report</a>}</div><div className="prose">{report.content || <span className="muted">No content yet.</span>}</div></section>
      {editable && <section className="panel form-panel" id="edit-report"><p className="eyebrow">{report.status === "returned" ? "REVISE & RESUBMIT" : "EDIT DRAFT"}</p><h2>Update report</h2><form action={editReportAction} className="report-form"><input type="hidden" name="id" value={id}/><label>Report title<input name="title" required maxLength={180} defaultValue={report.title}/></label><label>Submitter<input name="submitted_by_name" required maxLength={100} defaultValue={report.submitted_by_name ?? ""}/></label><label>Due date<input name="due_date" type="date" defaultValue={report.due_date ?? ""}/></label><label className="full">Content<textarea name="content" required minLength={20} maxLength={50000} rows={12} defaultValue={report.content ?? ""}/></label><label className="full">Change summary<input name="change_summary" maxLength={240} placeholder="What changed in this revision?"/></label><div className="full"><SubmitButton>Save revision</SubmitButton></div></form></section>}
      <section className="panel"><div className="section-heading"><div><p className="eyebrow">VERSION CONTROL</p><h2>Revision history</h2></div><span>{revisions.length} versions</span></div><RevisionList revisions={revisions}/></section>
    </div><aside className="side-column">
      {report.status === "under_review" && <section className="panel review-panel"><p className="eyebrow">MANAGER DECISION</p><h2>Complete review</h2><p>Record the reviewer and a clear decision comment.</p><form className="form-stack"><input type="hidden" name="id" value={id}/><label>Reviewer name<input name="reviewer" required maxLength={100} placeholder="Manager name"/></label><label>Review comment<textarea name="comment" required maxLength={3000} rows={6} placeholder="Document findings and next action…"/></label><div className="decision-actions"><button className="button approve" formAction={approveReportAction}>Approve</button><button className="button danger" formAction={returnReportAction}>Return for revision</button></div></form></section>}
      {report.status === "submitted" && <section className="panel callout"><p className="eyebrow">READY FOR REVIEW</p><h2>Claim this report</h2><p>Start review to unlock the manager decision panel.</p></section>}
      <section className="panel"><div className="section-heading"><div><p className="eyebrow">FEEDBACK</p><h2>Comments</h2></div><span>{comments.length}</span></div>{comments.length === 0 ? <div className="empty"><p>No review comments yet.</p></div> : <div className="comments">{comments.map(comment => <article key={comment.id}><div className="row between"><strong>{comment.author_name || "Manager"}</strong><span className={`action action-${comment.action}`}>{comment.action}</span></div><p>{comment.comment_text}</p><small>{new Date(comment.created_at).toLocaleString()}</small></article>)}</div>}</section>
      <section className="panel metadata"><h2>Report details</h2><dl><dt>Project</dt><dd>{project?.name}</dd><dt>Stage</dt><dd>{stage?.name}</dd><dt>Submitted</dt><dd>{report.submitted_at ? new Date(report.submitted_at).toLocaleString() : "Not yet"}</dd><dt>Reviewed</dt><dd>{report.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : "Not yet"}</dd></dl>{editable && <form action={deleteReportAction}><input type="hidden" name="id" value={id}/><DeleteButton label="Delete report"/></form>}</section>
    </aside></div>
  </>;
}

