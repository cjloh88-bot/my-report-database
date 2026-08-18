"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProject, deleteProject, updateProject } from "@/lib/data/projects";
import { createStage } from "@/lib/data/stages";
import { createReport, deleteReport } from "@/lib/data/reports";
import { createRevision } from "@/lib/data/revisions";
import { approveReport, editReport, returnReport, startReview, submitReport } from "@/lib/actions/report-flow";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const required = (form: FormData, key: string, label: string) => {
  const value = text(form, key); if (!value) throw new Error(`${label} is required.`); return value;
};
const refresh = () => { revalidatePath("/"); revalidatePath("/dashboard"); revalidatePath("/projects"); revalidatePath("/reports"); revalidatePath("/review"); };

export async function createProjectAction(form: FormData) {
  await createProject({ name: required(form, "name", "Project name"), description: text(form, "description") || null, owner_name: required(form, "owner_name", "Owner"), status: "active" });
  refresh();
}

export async function updateProjectAction(form: FormData) {
  const id = required(form, "id", "Project");
  await updateProject(id, { name: required(form, "name", "Project name"), description: text(form, "description") || null, owner_name: required(form, "owner_name", "Owner"), status: required(form, "status", "Status") });
  refresh(); revalidatePath(`/projects/${id}`);
}

export async function deleteProjectAction(form: FormData) { await deleteProject(required(form, "id", "Project")); refresh(); }

export async function createStageAction(form: FormData) {
  const projectId = required(form, "project_id", "Project");
  await createStage({ project_id: projectId, name: required(form, "name", "Stage name"), order_num: Number(text(form, "order_num") || 0) });
  refresh(); revalidatePath(`/projects/${projectId}`);
}

export async function createReportAction(form: FormData) {
  const report = await createReport({ project_id: required(form, "project_id", "Project"), stage_id: required(form, "stage_id", "Stage"), title: required(form, "title", "Title"), content: required(form, "content", "Content"), due_date: text(form, "due_date") || null, submitted_by_name: required(form, "submitted_by_name", "Submitter") });
  await createRevision({ report_id: report.id, content: report.content, changed_by_name: report.submitted_by_name, change_summary: "Initial draft" });
  refresh(); redirect(`/reports/${report.id}`);
}

export async function editReportAction(form: FormData) {
  const id = required(form, "id", "Report");
  await editReport(id, { title: required(form, "title", "Title"), content: required(form, "content", "Content"), due_date: text(form, "due_date") || null, submitted_by_name: required(form, "submitted_by_name", "Submitter"), change_summary: text(form, "change_summary") });
  refresh(); revalidatePath(`/reports/${id}`);
}

export async function deleteReportAction(form: FormData) { await deleteReport(required(form, "id", "Report")); refresh(); redirect("/reports"); }
export async function submitReportAction(form: FormData) { const id = required(form, "id", "Report"); await submitReport(id); refresh(); revalidatePath(`/reports/${id}`); }
export async function startReviewAction(form: FormData) { const id = required(form, "id", "Report"); await startReview(id); refresh(); revalidatePath(`/reports/${id}`); }
export async function approveReportAction(form: FormData) { const id = required(form, "id", "Report"); await approveReport(id, required(form, "reviewer", "Reviewer"), required(form, "comment", "Comment")); refresh(); revalidatePath(`/reports/${id}`); }
export async function returnReportAction(form: FormData) { const id = required(form, "id", "Report"); await returnReport(id, required(form, "reviewer", "Reviewer"), required(form, "comment", "Comment")); refresh(); revalidatePath(`/reports/${id}`); }

