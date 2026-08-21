import { NextResponse } from "next/server";
import { requireRole, getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant") && typeof message.content === "string" && message.content.trim().length > 0 && message.content.length <= 8000;
}

async function assertOwner() {
  await requireRole("admin");
  const user = await getCurrentUser();
  const ownerEmail = (process.env.ASSISTANT_OWNER_EMAIL || "cjloh88ai@gmail.com").trim().toLowerCase();
  if (!user?.email || user.email.toLowerCase() !== ownerEmail) throw new Error("Owner access required.");
}

async function getOperationalContext() {
  const client = await createClient();
  const [{ data: projects }, { data: reports }] = await Promise.all([
    client.from("projects").select("id,name,status,owner_name,created_at").order("created_at", { ascending: false }).limit(30),
    client.from("reports").select("id,title,status,due_date,project_id,submitted_at,reviewed_at").order("created_at", { ascending: false }).limit(60),
  ]);
  return JSON.stringify({ projects: projects || [], reports: reports || [] });
}

export async function POST(request: Request) {
  try {
    await assertOwner();
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "The OpenRouter key is not configured for this deployment." }, { status: 503 });

    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages.filter(isMessage).slice(-12) : [];
    if (!messages.length || messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "Enter a question for the assistant." }, { status: 400 });

    const context = await getOperationalContext();
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://my-report-database.vercel.app",
        "X-Title": "ReportBase Private Engineering Assistant",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openrouter/auto",
        messages: [
          {
            role: "system",
            content: `You are the private senior engineering assistant for ReportBase's owner. Help diagnose reporting workflow, data, review, account-access, and application issues. Be concise, practical, and safe. Use the supplied live operational summary when relevant, clearly distinguish evidence from assumptions, and give numbered troubleshooting steps. Never claim to have changed data, approved reports, removed users, or executed actions. Never ask for passwords, API keys, tokens, or customer secrets. ReportBase uses Next.js App Router, Supabase Auth/Postgres/RLS, and Vercel. Current operational summary (metadata only, no report bodies): ${context}`,
          },
          ...messages,
        ],
        max_tokens: 1200,
        temperature: 0.2,
        provider: { data_collection: "deny", allow_fallbacks: true },
      }),
      signal: AbortSignal.timeout(45000),
    });

    const result = await response.json();
    if (!response.ok) {
      const detail = result?.error?.message || `OpenRouter returned ${response.status}.`;
      return NextResponse.json({ error: detail }, { status: 502 });
    }
    const answer = result?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) return NextResponse.json({ error: "The assistant returned an empty response." }, { status: 502 });
    return NextResponse.json({ answer, model: result.model || process.env.OPENROUTER_MODEL || "openrouter/auto" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Assistant request failed.";
    const status = message.includes("access required") || message.includes("Owner access") ? 403 : 500;
    return NextResponse.json({ error: status === 500 ? "The assistant could not complete the request." : message }, { status });
  }
}
