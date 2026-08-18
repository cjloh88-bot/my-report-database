# Project Report Database — PRD

## Problem
Engineering teams track project reports through Excel, shared folders, email, and follow-up messages. Status is unclear, revisions are lost, approvals are verbal. This app centralizes report submission, review, and approval by development stage.

## Target User
- **Engineers/technicians**: submit and update project-stage reports.
- **Engineering managers**: review, comment, approve, or return reports for revision.

## Core Objects
- **Project**: a named engineering effort with an owner and status.
- **Stage**: a development phase within a project (e.g., Design Review, Prototype, Testing).
- **Report**: a submission tied to one project+stage, with status, content, due date, and submitter.
- **Review Comment**: manager feedback attached to a report, with an action (approve / return / comment).
- **Report Revision**: each content edit creates a revision row, preserving history.

## MVP (v1) — Must-Haves
- [ ] Project list with status badges
- [ ] Stage list per project
- [ ] Report create/edit form (title, content, due date, submitter name)
- [ ] Submit report → status becomes "submitted"
- [ ] Manager review view: read report, add comment, approve or return
- [ ] Approve → status "approved"; Return → status "returned", back to engineer
- [ ] Revision history visible per report
- [ ] Dashboard: all projects + current reporting status at a glance
- [ ] All pages viewable without login (demo-first)

## Non-Goals (v1)
- AI report generation, analytics dashboards, PowerPoint export
- Mobile app, ERP integration, email automation
- Task management, Gantt charts, resource allocation
- Multi-tenant or external user access

## Success Criteria
An engineer submits a report for project "Pump Redesign — Prototype" stage → the manager opens it, adds a comment, approves it → the dashboard shows that project's report as "approved" with the approval timestamp and comment visible. A second engineer submits a report that gets returned → it shows "returned" with the manager's comment, and the engineer can edit and resubmit. All visible on one dashboard without logging in.