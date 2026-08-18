import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { Project, Report, Stage } from "@/lib/data/types";

export function ReportCard({ report, project, stage }: { report: Report; project?: Project; stage?: Stage }) {
  return <Link className="report-card" href={`/reports/${report.id}`}>
    <div className="row between"><StatusBadge status={report.status}/><span className="muted small">{report.due_date ? `Due ${new Date(`${report.due_date}T00:00:00`).toLocaleDateString()}` : "No due date"}</span></div>
    <h3>{report.title}</h3>
    <p className="muted">{project?.name}{stage ? ` · ${stage.name}` : ""}</p>
    <div className="row between small"><span>By {report.submitted_by_name || "Unassigned"}</span><span>View report →</span></div>
  </Link>;
}

