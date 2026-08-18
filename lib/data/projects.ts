import { createClient } from "@/lib/supabase/server";
import type { Project } from "./types";

export async function listProjects() {
  const { data, error } = await (await createClient()).from("projects").select("*").order("created_at");
  if (error) throw error;
  return data as Project[];
}

export async function getProject(id: string) {
  const { data, error } = await (await createClient()).from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function createProject(input: Pick<Project, "name" | "description" | "owner_name" | "status">) {
  const { data, error } = await (await createClient()).from("projects").insert(input).select().single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, input: Partial<Pick<Project, "name" | "description" | "owner_name" | "status">>) {
  const { data, error } = await (await createClient()).from("projects").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string) {
  const { error } = await (await createClient()).from("projects").delete().eq("id", id);
  if (error) throw error;
}

