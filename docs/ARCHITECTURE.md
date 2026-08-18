# Architecture

## Stack
Next.js (App Router) + Supabase (Postgres) + Vercel. Tailwind for UI. No external services in v1.

## Build Sequence
1. **Now**: Project + stage + report CRUD, submit/review/approve/return flow, dashboard, revision history — all open, demo-seeded.
2. **Next**: Login/signup, per-user owner scoping, role separation (engineer vs manager), email-free notifications.
3. **Later**: Attachments, PDF export, activity timeline, analytics.

## Key User Action Flow (Submit → Review → Approve)
1. Engineer opens a project stage, clicks "New Report", fills title + content + due date → saves (status: draft).
2. Engineer clicks "Submit" → status becomes `submitted`.
3. Manager sees report in review queue, opens it, reads content, types a comment.
4. Manager clicks "Approve" → status `approved`, review comment + reviewer name + timestamp saved.
   — or clicks "Return" → status `returned`, comment saved, report back in engineer's edit queue.
5. Engineer edits a returned report → new revision row created → resubmits.
6. Dashboard reflects the latest status for every project-stage.

## Responsive Nav Shell
Persistent left sidebar (desktop): Projects, Reports, Review Queue, Dashboard. Collapses to hamburger menu on mobile. Current section highlighted.

## Layer Plan
1. **Data layer** (`lib/data/`): all DB reads/writes — projects, stages, reports, comments, revisions. Supabase client only here.
2. **App logic** (`lib/actions/`): submit-report, review-report, approve-report, return-report — server-side functions that validate status transitions and write.
3. **UI** (`app/` + `components/`): pages and components call lib/data and lib/actions, never touch Supabase directly.
4. **Intelligence** (`lib/ai/`): empty in v1. Placeholder for later report summarization/scoring.

## Why Core Runs Without AI
Every action is a database write with status validation. No AI field, scoring, or generation is needed to submit, review, approve, or return a report.

## Repo Structure
```
lib/data/        # projects.ts, stages.ts, reports.ts, comments.ts, revisions.ts
lib/actions/     # report-flow.ts (submit, review, approve, return)
lib/ai/          # empty stub v1
app/             # routes: /, /projects/[id], /reports/[id], /review, /dashboard
components/       # ReportForm, StatusBadge, ReviewPanel, RevisionList, Sidebar
__tests__/        # beside each module
```

## Module Map
| Module | Responsibility | Owns | Build Order |
|--------|---------------|------|-------------|
| projects | Project list + detail | projects table | 1 |
| stages | Stage list per project | stages table | 1 |
| reports | Report CRUD + status engine | reports, report_revisions | 2 |
| comments | Review comments + approve/return | review_comments | 2 |
| review-queue | Manager's pending-review list | joins reports + comments | 3 |
| dashboard | Cross-project status overview | reads all tables | 4 |
| auth (later) | Login, roles, RLS scoping | auth.users integration | 5 |