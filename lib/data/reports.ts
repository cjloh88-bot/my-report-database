import { createClient } from "@/lib/supabase/server";
import type { Report, ReportStatus } from "./types";

export async function listReports(filters?: { projectId?: string; stageId?: string; statuses?: ReportStatus[] }) {
  const client = await createClient();
  let query = client.from("reports").select("*").order("created_at", { ascending: false });
  if (filters?.projectId) query = query.eq("project_id", filters.projectId);
  if (filters?.stageId) query = query.eq("stage_id", filters.stageId);
  if (filters?.statuses?.length) query = query.in("status", filters.statuses);
  const { data, error } = await query;
  if (error) throw error;
  return data as Report[];
}

export async function getReport(id: string) {
  const { data, error } = await (await createClient()).from("reports").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Report | null;
}

export async function createReport(input: Pick<Report, "project_id" | "stage_id" | "title" | "content" | "due_date" | "submitted_by_name">) {
  const { data, error } = await (await createClient()).from("reports").insert({ ...input, status: "draft" }).select().single();
  if (error) throw error;
  return data as Report;
}

export async function updateReport(id: string, input: Partial<Report>) {
  const { data, error } = await (await createClient()).from("reports").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Report;
}

export async function deleteReport(id: string) {
  const { error } = await (await createClient()).from("reports").delete().eq("id", id);
  if (error) throw error;
}

