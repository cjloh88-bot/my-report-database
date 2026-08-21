import { AssistantChat } from "@/components/assistant-chat";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  await requireRole("admin");
  const user = await getCurrentUser();
  const ownerEmail = (process.env.ASSISTANT_OWNER_EMAIL || "cjloh88ai@gmail.com").trim().toLowerCase();
  if (!user?.email || user.email.toLowerCase() !== ownerEmail) notFound();
  return <><header className="page-header"><div><p className="eyebrow">PRIVATE · OWNER ONLY</p><h1>Engineering assistant</h1><p>Expert support for diagnosing issues across ReportBase without changing records or making review decisions.</p></div><span className="assistant-status"><i/>OpenRouter</span></header><AssistantChat/></>;
}
