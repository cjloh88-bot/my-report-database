import { createClient } from "@/lib/supabase/server";
import type { Stage } from "./types";

export async function listStages(projectId?: string) {
  const client = await createClient();
  let query = client.from("stages").select("*").order("order_num");
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Stage[];
}

export async function createStage(input: Pick<Stage, "project_id" | "name" | "order_num" | "user_id">) {
  const { data, error } = await (await createClient()).from("stages").insert(input).select().single();
  if (error) throw error;
  return data as Stage;
}

export async function updateStage(id: string, input: Partial<Pick<Stage, "name" | "order_num">>) {
  const { data, error } = await (await createClient()).from("stages").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Stage;
}
