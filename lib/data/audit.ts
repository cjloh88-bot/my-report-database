import { createClient } from "@/lib/supabase/server";

export type AuditLog = { id: string; actor_id: string | null; actor_name: string; action: string; target_type: string; target_id: string | null; detail: Record<string, unknown>; created_at: string };

export async function listAuditLogs(filters?: { targetType?: string; targetId?: string; limit?: number }) {
  let query = (await createClient()).from("audit_logs").select("*").order("created_at", { ascending: false }).limit(filters?.limit ?? 100);
  if (filters?.targetType) query = query.eq("target_type", filters.targetType);
  if (filters?.targetId) query = query.eq("target_id", filters.targetId);
  const { data, error } = await query;
  if (error) throw error;
  return data as AuditLog[];
}

