"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const prompts = [
  "Why might a submitted report not appear in the review queue?",
  "Help me troubleshoot a user who cannot access their project.",
  "Which reports currently need attention?",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(question: string) {
    const content = question.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user", content } as Message];
    setMessages(next); setInput(""); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Assistant request failed.");
      setMessages([...next, { role: "assistant", content: result.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant request failed.");
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void send(input); }

  return <section className="assistant-shell">
    <div className="assistant-intro panel"><div className="assistant-orb">✦</div><div><h2>What needs attention?</h2><p>I can diagnose workflow, report, review, data, and account-access issues using current project and report metadata.</p></div></div>
    {!messages.length && <div className="assistant-prompts">{prompts.map(prompt => <button key={prompt} type="button" onClick={() => void send(prompt)}>{prompt}<span>→</span></button>)}</div>}
    <div className="assistant-thread" aria-live="polite">{messages.map((message, index) => <article key={index} className={`assistant-message ${message.role}`}><span>{message.role === "assistant" ? "AI" : "You"}</span><div>{message.content}</div></article>)}{busy && <article className="assistant-message assistant"><span>AI</span><div className="typing">Checking the system context…</div></article>}</div>
    {error && <p className="form-message error-message" role="alert">{error}</p>}
    <form className="assistant-composer" onSubmit={submit}><label htmlFor="assistant-question" className="sr-only">Ask the engineering assistant</label><textarea id="assistant-question" value={input} onChange={event => setInput(event.target.value)} placeholder="Describe the issue, error, or workflow you need help with…" maxLength={8000} rows={3} disabled={busy}/><button className="button" type="submit" disabled={busy || !input.trim()}>Send</button></form>
    <p className="assistant-privacy">Private owner tool · Read-only operational context · Do not enter passwords, API keys, or customer secrets.</p>
  </section>;
}
