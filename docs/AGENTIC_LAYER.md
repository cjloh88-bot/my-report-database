# Agentic Layer

## v1 Status
No automated actions in v1. All actions are human-initiated via the UI.

## Later: Draftable Actions
| Action | Risk | Auto? | Draft → Approval → Action |
|-------|------|-------|--------------------------|
| Draft return comment | Low | Auto-draft | AI suggests comment text → manager edits → saves |
| Draft status reminder | Low | Auto-draft | AI drafts overdue notice text → manager sends manually |
| Suggest reviewer | Low | Auto-suggest | AI names likely manager based on project → submitter confirms |

## Executable After Approval
| Action | Risk | Flow |
|-------|------|------|
| Auto-return overdue reports | Medium | AI flags overdue → manager approves → status set to returned |
| Assign follow-up stage | Medium | AI suggests next stage → manager approves → stage created |

## Human-Only (never automated)
| Action | Risk | Why |
|-------|------|-----|
| Approve report | High | Manager decision, audit significance |
| Delete report | Critical | Data loss, irreversible |
| Delete project | Critical | Data loss |

## Named Tools (later)
- `flag_overdue_reports` — reads reports where due_date < now and status in (draft, returned), marks them.
- `suggest_comment` — given report content + history, returns a draft comment string.
- No `run_any` / `send_any` tools. Every tool is named, scoped, and logged.

## Audit Log Fields
| Field | Type |
|-------|------|
| id | uuid |
| actor_name | text |
| action | text |
| target_type | text (report/project/stage) |
| target_id | uuid |
| detail | jsonb |
| created_at | timestamptz |

**Principle**: every status change, comment, approval, and return writes an audit log row.

## v1 vs Later
- v1: status changes write to `report_revisions` and `review_comments` only.
- Later: dedicated `audit_logs` table + automated draft actions behind approval gates.