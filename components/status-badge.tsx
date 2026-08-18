import type { ReportStatus } from "@/lib/data/types";

export function StatusBadge({ status }: { status: ReportStatus | string }) {
  return <span className={`badge badge-${status}`}>{status.replaceAll("_", " ")}</span>;
}

