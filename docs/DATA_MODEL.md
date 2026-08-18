# Data Model

## projects
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| name | text | required |
| description | text | nullable |
| owner_name | text | engineer responsible |
| status | text | default 'active' |
| user_id | uuid | nullable (for later scoping) |
| created_at | timestamptz | default now() |

## stages
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| name | text | e.g. "Design Review" |
| order_num | int | display order |
| user_id | uuid | nullable |
| created_at | timestamptz | default now() |

## reports
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| stage_id | uuid | FK → stages |
| title | text | required |
| content | text | report body |
| submitted_by_name | text | engineer name |
| reviewed_by_name | text | manager name, nullable |
| status | text | draft / submitted / under_review / approved / returned |
| due_date | date | nullable |
| submitted_at | timestamptz | nullable |
| reviewed_at | timestamptz | nullable |
| user_id | uuid | nullable |
| created_at | timestamptz | default now() |

**Status transition rules** (enforced in `lib/actions/report-flow.ts`):
- draft → submitted
- submitted → under_review
- under_review → approved | returned
- returned → draft (engineer edits) → submitted (resubmit)
- approved is terminal unless a new revision is explicitly started.

## report_revisions
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| report_id | uuid | FK → reports |
| revision_number | int | increments per report |
| content | text | snapshot of report content at edit time |
| changed_by_name | text | who edited |
| change_summary | text | short note |
| created_at | timestamptz | default now() |

## review_comments
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| report_id | uuid | FK → reports |
| author_name | text | manager name |
| comment_text | text | feedback body |
| action | text | 'approve' / 'return' / 'comment' |
| created_at | timestamptz | default now() |

## RLS / Permissions
- v1: all tables open (permissive policies) for demo-first.
- Later: `auth.uid() = user_id` on projects, stages, reports. Managers get read on all; engineers get write only on own reports.

## AI Fields
None in v1. When added later (report quality scoring), fields will follow: `value`, `source text`, `confidence numeric`, `review_status text default 'unreviewed'`.