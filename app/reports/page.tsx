import { listReports } from "@/lib/data/reports";
import { listProjects } from "@/lib/data/projects";
import { listStages } from "@/lib/data/stages";
import { ReportCard } from "@/components/report-card";
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [reports, projects, stages] = await Promise.all([listReports(), listProjects(), listStages()]);
  return <><header className="page-header"><div><p className="eyebrow">REPORT REGISTER</p><h1>All reports</h1><p>Drafts, submissions, decisions, and returned work.</p></div></header><section className="panel"><div className="section-heading"><h2>Report library</h2><span>{reports.length} records</span></div>{reports.length === 0 ? <div className="empty"><h3>No reports yet</h3><p>Open a project and create a report in one of its stages.</p></div> : <div className="report-grid">{reports.map(report => <ReportCard key={report.id} report={report} project={projects.find(p => p.id === report.project_id)} stage={stages.find(s => s.id === report.stage_id)}/>)}</div>}</section></>;
}

