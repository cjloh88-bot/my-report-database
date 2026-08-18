export type ReportStatus = "draft" | "submitted" | "under_review" | "approved" | "returned";

export type Project = {
  id: string; name: string; description: string | null; owner_name: string | null;
  status: string; created_at: string;
};

export type Stage = {
  id: string; project_id: string; name: string; order_num: number; created_at: string;
};

export type Report = {
  id: string; project_id: string; stage_id: string; title: string; content: string | null;
  submitted_by_name: string | null; reviewed_by_name: string | null; status: ReportStatus;
  due_date: string | null; submitted_at: string | null; reviewed_at: string | null; created_at: string;
};

export type ReviewComment = {
  id: string; report_id: string; author_name: string | null; comment_text: string | null;
  action: "approve" | "return" | "comment"; created_at: string;
};

export type Revision = {
  id: string; report_id: string; revision_number: number; content: string | null;
  changed_by_name: string | null; change_summary: string | null; created_at: string;
};

