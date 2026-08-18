import { createClient } from "@/lib/supabase/server";
import type { Revision } from "./types";

export async function listRevisions(reportId: string) {
  const { data, error } = await (await createClient()).from("report_revisions").select("*").eq("report_id", reportId).order("revision_number", { ascending: false });
  if (error) throw error;
  return data as Revision[];
}

export async function createRevision(input: Omit<Revision, "id" | "created_at" | "revision_number">) {
  const revisions = await listRevisions(input.report_id);
  const revision_number = (revisions[0]?.revision_number ?? 0) + 1;
  const { data, error } = await (await createClient()).from("report_revisions").insert({ ...input, revision_number }).select().single();
  if (error) throw error;
  return data as Revision;
}
