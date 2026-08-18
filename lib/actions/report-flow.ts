import { createClient } from "@/lib/supabase/server";
import { createComment } from "@/lib/data/comments";
import { getReport, updateReport } from "@/lib/data/reports";
import { createRevision } from "@/lib/data/revisions";
import type { ReportStatus } from "@/lib/data/types";

const allowed: Record<ReportStatus, ReportStatus[]> = {
  draft: ["submitted"], submitted: ["under_review"], under_review: ["approved", "returned"],
  returned: ["draft"], approved: [],
};

async function transition(id: string, target: ReportStatus, extra: Record<string, unknown> = {}) {
  const report = await getReport(id);
  if (!report) throw new Error("Report not found.");
  if (!allowed[report.status].includes(target)) throw new Error(`Cannot move a ${report.status} report to ${target}.`);
  const client = await createClient();
  const { data, error } = await client.from("reports").update({ status: target, ...extra }).eq("id", id).eq("status", report.status).select().single();
  if (error) throw error;
  return data;
}

export async function submitReport(id: string) {
  const report = await getReport(id);
  if (!report?.content?.trim() || !report.title.trim() || !report.submitted_by_name?.trim()) throw new Error("Complete the title, content, and submitter before submitting.");
  return transition(id, "submitted", { submitted_at: new Date().toISOString(), reviewed_at: null, reviewed_by_name: null });
}

export async function startReview(id: string) { return transition(id, "under_review"); }

export async function approveReport(id: string, reviewer: string, comment: string) {
  if (!reviewer.trim() || !comment.trim()) throw new Error("Reviewer name and approval comment are required.");
  await transition(id, "approved", { reviewed_by_name: reviewer.trim(), reviewed_at: new Date().toISOString() });
  return createComment({ report_id: id, author_name: reviewer.trim(), comment_text: comment.trim(), action: "approve" });
}

export async function returnReport(id: string, reviewer: string, comment: string) {
  if (!reviewer.trim() || !comment.trim()) throw new Error("Reviewer name and return reason are required.");
  await transition(id, "returned", { reviewed_by_name: reviewer.trim(), reviewed_at: new Date().toISOString() });
  return createComment({ report_id: id, author_name: reviewer.trim(), comment_text: comment.trim(), action: "return" });
}

export async function editReport(id: string, input: { title: string; content: string; due_date: string | null; submitted_by_name: string; change_summary: string }) {
  const current = await getReport(id);
  if (!current) throw new Error("Report not found.");
  if (!(["draft", "returned"] as ReportStatus[]).includes(current.status)) throw new Error("Only draft or returned reports can be edited.");
  if (!input.title.trim() || !input.content.trim() || !input.submitted_by_name.trim()) throw new Error("Title, content, and submitter are required.");
  if (input.content !== (current.content ?? "")) await createRevision({ report_id: id, content: input.content, changed_by_name: input.submitted_by_name, change_summary: input.change_summary || "Report updated" });
  return updateReport(id, { title: input.title.trim(), content: input.content.trim(), due_date: input.due_date, submitted_by_name: input.submitted_by_name.trim(), status: current.status === "returned" ? "draft" : "draft" });
}

