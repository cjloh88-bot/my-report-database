import { createClient } from "@/lib/supabase/server";
import type { ReviewComment } from "./types";

export async function listComments(reportId: string) {
  const { data, error } = await (await createClient()).from("review_comments").select("*").eq("report_id", reportId).order("created_at");
  if (error) throw error;
  return data as ReviewComment[];
}

export async function createComment(input: Omit<ReviewComment, "id" | "created_at">) {
  const { data, error } = await (await createClient()).from("review_comments").insert(input).select().single();
  if (error) throw error;
  return data as ReviewComment;
}

