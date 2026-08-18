import type { Revision } from "@/lib/data/types";

function Diff({ previous, current }: { previous: string; current: string }) {
  const before = new Set(previous.split(/\s+/));
  return <p className="diff-text">{current.split(/\s+/).map((word, index) => <span className={before.has(word) ? "" : "added"} key={`${word}-${index}`}>{word}{" "}</span>)}</p>;
}

export function RevisionList({ revisions }: { revisions: Revision[] }) {
  if (!revisions.length) return <div className="empty"><p>No revisions recorded yet.</p></div>;
  return <div className="timeline">{revisions.map((revision, index) => { const previous = revisions[index + 1]; return <details key={revision.id} open={index === 0}><summary><span>Revision {revision.revision_number}</span><small>{revision.changed_by_name || "Unknown"} · {new Date(revision.created_at).toLocaleString()}</small></summary><div className="revision-body"><strong>{revision.change_summary || "Content updated"}</strong>{previous ? <Diff previous={previous.content || ""} current={revision.content || ""}/> : <p>{revision.content}</p>}</div></details>})}</div>;
}

