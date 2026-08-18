import { listReports } from "@/lib/data/reports";
import { listProjects } from "@/lib/data/projects";
import { listStages } from "@/lib/data/stages";
import { ReportCard } from "@/components/report-card";
import { requireAnyRole } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  await requireAnyRole("manager", "admin");
  const [reports, projects, stages] = await Promise.all([listReports({ statuses: ["submitted", "under_review"] }), listProjects(), listStages()]);
  reports.sort((a,b) => String(a.due_date || "9999").localeCompare(String(b.due_date || "9999")));
  return <><header className="page-header"><div><p className="eyebrow">MANAGER WORKBENCH</p><h1>Review queue</h1><p>Due-date ordered reports waiting for an engineering decision.</p></div><span className="queue-count">{reports.length}<small>waiting</small></span></header><section className="panel">{reports.length === 0 ? <div className="empty success-empty"><h3>Queue clear</h3><p>There are no submitted or under-review reports.</p></div> : <div className="report-grid">{reports.map(report => <ReportCard key={report.id} report={report} project={projects.find(p => p.id === report.project_id)} stage={stages.find(s => s.id === report.stage_id)}/>)}</div>}</section></>;
}
