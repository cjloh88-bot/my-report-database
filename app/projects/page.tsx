import Link from "next/link";
import { listProjects } from "@/lib/data/projects";
import { listStages } from "@/lib/data/stages";
import { listReports } from "@/lib/data/reports";
import { createProjectAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { requireProfile } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, stages, reports] = await Promise.all([listProjects(), listStages(), listReports()]);
  const profile = await requireProfile();
  return <><header className="page-header"><div><p className="eyebrow">PORTFOLIO</p><h1>Projects</h1><p>Create an engineering effort, then organize its stage reports.</p></div></header>
    <section className="split-layout"><div className="panel"><div className="section-heading"><h2>All projects</h2><span>{projects.length} total</span></div>
      {projects.length === 0 ? <div className="empty"><h3>No projects yet</h3><p>Use the form to create the first one.</p></div> : <div className="project-list">{projects.map(project => <Link href={`/projects/${project.id}`} key={project.id}><div><span className="project-status">{project.status}</span><h3>{project.name}</h3><p>{project.description || "No description"}</p></div><div className="project-meta"><strong>{stages.filter(s => s.project_id === project.id).length}</strong><span>stages</span><strong>{reports.filter(r => r.project_id === project.id).length}</strong><span>reports</span><b>→</b></div></Link>)}</div>}
    </div>{profile.role === "engineer" ? <aside className="panel form-panel"><p className="eyebrow">NEW PROJECT</p><h2>Start a project</h2><form action={createProjectAction} className="form-stack"><label>Project name<input name="name" maxLength={120} required placeholder="e.g. Pump Redesign"/></label><label>Description<textarea name="description" maxLength={1000} rows={4} placeholder="Purpose and scope"/></label><SubmitButton>Create project</SubmitButton></form></aside> : <aside className="panel callout"><p className="eyebrow">MANAGER VIEW</p><h2>Portfolio oversight</h2><p>Managers review submitted work. Engineers create and own projects.</p></aside>}</section></>;
}
