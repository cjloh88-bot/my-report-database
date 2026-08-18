import type { Revision } from "@/lib/data/types";

function Diff({ previous, current }: { previous: string; current: string }) {
  const beforeWords = previous.split(/\s+/); const currentWords = current.split(/\s+/);
  const before = new Set(beforeWords); const after = new Set(currentWords);
  const removed = beforeWords.filter(word => !after.has(word));
  return <div className="diff-text">{removed.length > 0 && <p className="removed"><strong>Removed:</strong> {removed.join(" ")}</p>}<p><strong>Current:</strong> {currentWords.map((word, index) => <span className={before.has(word) ? "" : "added"} key={`${word}-${index}`}>{word}{" "}</span>)}</p></div>;
}

export function RevisionList({ revisions }: { revisions: Revision[] }) {
  if (!revisions.length) return <div className="empty"><p>No revisions recorded yet.</p></div>;
  return <div className="timeline">{revisions.map((revision, index) => { const previous = revisions[index + 1]; return <details key={revision.id} open={index === 0}><summary><span>Revision {revision.revision_number}</span><small>{revision.changed_by_name || "Unknown"} · {new Date(revision.created_at).toLocaleString()}</small></summary><div className="revision-body"><strong>{revision.change_summary || "Content updated"}</strong>{previous ? <Diff previous={previous.content || ""} current={revision.content || ""}/> : <p>{revision.content}</p>}</div></details>})}</div>;
}
