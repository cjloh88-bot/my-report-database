import { requireProfile } from "@/lib/auth";
import { listAuditLogs } from "@/lib/data/audit";
import { ActivityList } from "@/components/activity-list";
export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  await requireProfile(); const logs = await listAuditLogs({ limit: 150 });
  return <><header className="page-header"><div><p className="eyebrow">SYSTEM MEMORY</p><h1>Activity history</h1><p>An append-only record of project, report, revision, and review changes.</p></div><span className="queue-count">{logs.length}<small>events</small></span></header><section className="panel"><ActivityList logs={logs}/></section></>;
}

