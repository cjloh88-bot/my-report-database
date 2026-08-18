"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProject, deleteProject, updateProject } from "@/lib/data/projects";
import { createStage } from "@/lib/data/stages";
import { createReport, deleteReport } from "@/lib/data/reports";
import { createRevision } from "@/lib/data/revisions";
import { approveReport, commentOnReport, editReport, returnReport, startReview, submitReport } from "@/lib/actions/report-flow";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const required = (form: FormData, key: string, label: string) => {
  const value = text(form, key); if (!value) throw new Error(`${label} is required.`); return value;
};
const limited = (form: FormData, key: string, label: string, max: number, min = 1) => {
  const value = required(form, key, label);
  if (value.length < min || value.length > max) throw new Error(`${label} must be between ${min} and ${max} characters.`);
  return value;
};
const optionalLimited = (form: FormData, key: string, label: string, max: number) => {
  const value = text(form, key);
  if (value.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return value || null;
};
const dateValue = (form: FormData) => {
  const value = text(form, "due_date");
  if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Due date must use YYYY-MM-DD format.");
  return value || null;
};
const refresh = () => { revalidatePath("/"); revalidatePath("/dashboard"); revalidatePath("/projects"); revalidatePath("/reports"); revalidatePath("/review"); };

export async function createProjectAction(form: FormData) {
  await createProject({ name: limited(form, "name", "Project name", 120), description: optionalLimited(form, "description", "Description", 1000), owner_name: limited(form, "owner_name", "Owner", 100), status: "active" });
  refresh();
}

export async function updateProjectAction(form: FormData) {
  const id = required(form, "id", "Project");
  const status = required(form, "status", "Status");
  if (!["active", "on_hold", "completed"].includes(status)) throw new Error("Invalid project status.");
  await updateProject(id, { name: limited(form, "name", "Project name", 120), description: optionalLimited(form, "description", "Description", 1000), owner_name: limited(form, "owner_name", "Owner", 100), status });
  refresh(); revalidatePath(`/projects/${id}`);
}

export async function deleteProjectAction(form: FormData) { await deleteProject(required(form, "id", "Project")); refresh(); }

export async function createStageAction(form: FormData) {
  const projectId = required(form, "project_id", "Project");
  const order = Number(text(form, "order_num") || 0);
  if (!Number.isInteger(order) || order < 0 || order > 999) throw new Error("Display order must be a whole number from 0 to 999.");
  await createStage({ project_id: projectId, name: limited(form, "name", "Stage name", 100), order_num: order });
  refresh(); revalidatePath(`/projects/${projectId}`);
}

export async function createReportAction(form: FormData) {
  const report = await createReport({ project_id: required(form, "project_id", "Project"), stage_id: required(form, "stage_id", "Stage"), title: limited(form, "title", "Title", 180), content: limited(form, "content", "Content", 50000, 20), due_date: dateValue(form), submitted_by_name: limited(form, "submitted_by_name", "Submitter", 100) });
  await createRevision({ report_id: report.id, content: report.content, changed_by_name: report.submitted_by_name, change_summary: "Initial draft" });
  refresh(); redirect(`/reports/${report.id}`);
}

export async function editReportAction(form: FormData) {
  const id = required(form, "id", "Report");
  await editReport(id, { title: limited(form, "title", "Title", 180), content: limited(form, "content", "Content", 50000, 20), due_date: dateValue(form), submitted_by_name: limited(form, "submitted_by_name", "Submitter", 100), change_summary: optionalLimited(form, "change_summary", "Change summary", 240) || "" });
  refresh(); revalidatePath(`/reports/${id}`);
}

export async function deleteReportAction(form: FormData) { await deleteReport(required(form, "id", "Report")); refresh(); redirect("/reports"); }
export async function submitReportAction(form: FormData) { const id = required(form, "id", "Report"); await submitReport(id); refresh(); revalidatePath(`/reports/${id}`); }
export async function startReviewAction(form: FormData) { const id = required(form, "id", "Report"); await startReview(id); refresh(); revalidatePath(`/reports/${id}`); }
export async function commentOnReportAction(form: FormData) { const id = required(form, "id", "Report"); await commentOnReport(id, limited(form, "reviewer", "Reviewer", 100), limited(form, "comment", "Comment", 3000)); refresh(); revalidatePath(`/reports/${id}`); }
export async function approveReportAction(form: FormData) { const id = required(form, "id", "Report"); await approveReport(id, limited(form, "reviewer", "Reviewer", 100), limited(form, "comment", "Comment", 3000)); refresh(); revalidatePath(`/reports/${id}`); }
export async function returnReportAction(form: FormData) { const id = required(form, "id", "Report"); await returnReport(id, limited(form, "reviewer", "Reviewer", 100), limited(form, "comment", "Comment", 3000)); refresh(); revalidatePath(`/reports/${id}`); }
