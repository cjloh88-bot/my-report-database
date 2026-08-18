# Tasks — Sprints

## Sprint 1: Database + Core CRUD (Open Demo)
**Goal**: Projects, stages, and reports exist in the DB with seeded demo data; all pages render without login.
- [ ] Create migration SQL (all 5 tables + RLS + seed data)
- [ ] `lib/data/projects.ts` — list, get, create, update, delete
- [ ] `lib/data/stages.ts` — list by project, create, update
-- [ ] `lib/data/reports.ts` — list, get, create, update, delete
- [ ] `lib/data/revisions.ts` — list by report, create on edit
- [ ] `lib/data/comments.ts` — list by report, create
- [ ] Sidebar shell + Projects page + Project detail (stages listed)
- [ ] Report list page + Report detail (shows content + revisions + comments)
- [ ] Empty / loading / error states on all list pages
**DoD**: Open the app without login → see 3 seeded projects with stages and reports. Each page handles empty and loading states.

## Sprint 2: Submit → Review → Approve/Return Engine  ← **v1 Functional Milestone**
**Goal**: The core workflow works end-to-end; dashboard shows live status.
- [ ] `lib/actions/report-flow.ts` — submitReport, startReview, approveReport, returnReport with status validation
- [ ] Report create/edit form (title, content, due date, submitter name)
- [ ] Submit button → status `submitted`
- [ ] Review queue page (all `submitted` + `under_review` reports)
- [ ] Review panel: read content, type comment, Approve / Return buttons
- [ ] Approve → status `approved` + comment saved + timestamp
- [ ] Return → status `returned` + comment saved
- [ ] Edit returned report → new revision row → resubmit
- [ ] Dashboard: all projects + latest report status per stage
- [ ] Status transition validation blocks illegal moves (e.g., can't approve a draft)
**DoD**: Engineer submits a report → manager approves it → dashboard shows "approved" with timestamp and comment. A returned report can be edited and resubmitted. **This is the first fully working app.**

## Sprint 3: Polish + Edge Cases
**Goal**: Every state and error path is solid; UI copy is clear.
- [ ] All five states (loading, empty, partial, error, ready) on every screen
- [ ] Form validation (required fields, date format, length limits)
- [ ] Confirmation dialog on delete actions
- [ ] Responsive layout pass (mobile hamburger, table widths)
- [ ] Keyboard accessibility on sidebar and forms
- [ ] Revision history diff view (simple text comparison)
**DoD**: No dead buttons, no seed-data-only screens, no unhandled errors. Every form persists to DB and UI reflects it.

## Sprint 4: Lock It Down (Auth + RLS)
**Goal**: Real users can log in; data is owner-scoped; roles separated.
- [ ] Supabase auth (login/signup pages)
- [ ] `user_id` populated on create
- [ ] RLS: replace permissive policies with `auth.uid() = user_id` for owner scoping
- [ ] Role flags: engineer vs manager (in profiles or a roles table)
- [ ] Managers can approve/return any report; engineers only own
- [ ] Redirect to login when not authenticated
**DoD**: Logged-out user cannot write data. Engineer cannot approve reports. Manager cannot create reports (or can, depending on team). All seeded demo rows still visible.

## Sprint 5: Intelligence + Agentic (Later)
- [ ] Report completeness scoring (rule-based)
- [ ] Review queue ranking by urgency + score
- [ ] Overdue report flagging
- [ ] Draft comment suggestions
- [ ] Audit log table + logging on all actions

---

## Text Gantt
```
Sprint 1: DB + CRUD (open demo)      ████████
Sprint 2: Core engine + dashboard    ████████  ← v1 functional
Sprint 3: Polish + edge cases           ████
Sprint 4: Auth + RLS lock-down               ████
Sprint 5: Intelligence + agentic                   ████
```