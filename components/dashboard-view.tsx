import Link from "next/link";
import { listProjects } from "@/lib/data/projects";
import { listStages } from "@/lib/data/stages";
import { listReports } from "@/lib/data/reports";
import { listComments } from "@/lib/data/comments";
import { StatusBadge } from "./status-badge";

export async function DashboardView() {
  const [projects, stages, reports] = await Promise.all([listProjects(), listStages(), listReports()]);
  const approved = reports.filter(r => r.status === "approved").length;
  const waiting = reports.filter(r => r.status === "submitted" || r.status === "under_review").length;
  const returned = reports.filter(r => r.status === "returned").length;
  const recentReviewed = reports.filter(r => r.reviewed_at).sort((a,b) => String(b.reviewed_at).localeCompare(String(a.reviewed_at))).slice(0,3);
  const commentPairs = await Promise.all(recentReviewed.map(async r => [r.id, (await listComments(r.id)).at(-1)] as const));
  const lastComments = new Map(commentPairs);
  return <>
    <header className="page-header"><div><p className="eyebrow">OPERATIONS OVERVIEW</p><h1>Reporting dashboard</h1><p>Every stage, decision, and handoff in one place.</p></div><Link className="button" href="/projects">+ New report</Link></header>
    <section className="stats" aria-label="Report status summary">
      <div><span>Total reports</span><strong>{reports.length}</strong><small>Across {projects.length} projects</small></div>
      <div><span>Awaiting review</span><strong>{waiting}</strong><small>Needs manager action</small></div>
      <div><span>Approved</span><strong>{approved}</strong><small>Completed decisions</small></div>
      <div><span>Returned</span><strong>{returned}</strong><small>Needs revision</small></div>
    </section>
    <section className="panel"><div className="section-heading"><div><p className="eyebrow">LIVE PIPELINE</p><h2>Project stage status</h2></div><Link href="/projects">Manage projects →</Link></div>
      {projects.length === 0 ? <div className="empty"><h3>No projects yet</h3><p>Create the first project from Projects.</p></div> : <div className="project-grid">{projects.map(project => {
        const projectStages = stages.filter(s => s.project_id === project.id);
        return <article className="project-overview" key={project.id}><div className="row between"><div><h3><Link href={`/projects/${project.id}`}>{project.name}</Link></h3><p className="muted small">Owner: {project.owner_name}</p></div><span className="project-status">{project.status}</span></div>
          <div className="stage-list">{projectStages.length ? projectStages.map(stage => { const latest = reports.filter(r => r.stage_id === stage.id)[0]; return <Link href={latest ? `/reports/${latest.id}` : `/projects/${project.id}`} key={stage.id}><span>{stage.name}</span>{latest ? <StatusBadge status={latest.status}/> : <span className="badge badge-none">no report</span>}</Link> }) : <p className="muted small">No stages yet</p>}</div>
        </article>})}</div>}
    </section>
    <section className="panel"><div className="section-heading"><div><p className="eyebrow">RECENT DECISIONS</p><h2>Review outcomes</h2></div><Link href="/review">Open review queue →</Link></div>
      {recentReviewed.length === 0 ? <div className="empty"><p>No review decisions yet.</p></div> : <div className="decision-list">{recentReviewed.map(report => { const comment = lastComments.get(report.id); return <Link href={`/reports/${report.id}`} key={report.id}><StatusBadge status={report.status}/><div><strong>{report.title}</strong><p>“{comment?.comment_text || "No decision comment recorded."}”</p><small>{report.reviewed_by_name} · {report.reviewed_at && new Date(report.reviewed_at).toLocaleString()}</small></div></Link> })}</div>}
    </section>
  </>;
}

