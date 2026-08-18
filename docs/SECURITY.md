# Security

## Secret Handling
- Supabase URL and anon key: public-safe, exposed via `NEXT_PUBLIC_` env vars.
- Supabase service role key: server-side only, never in frontend code, never in client bundles.
- All DB reads/writes go through `lib/data/` using the anon client for v1 (open RLS). Service key used only in server actions if needed later.

## Permission Model
### v1 (Demo-First)
- All tables have permissive RLS policies: anyone can read and write.
- No login required. Submitted-by and reviewed-by are name strings.
- Purpose: instant demoability without auth friction.

### Later (Lock-Down)
- `auth.uid() = user_id` on projects, stages, reports for owner scoping.
- Engineers: write own reports, read all project data.
- Managers: read all, write review_comments, update report status (approve/return).
- Admins: all access including delete.

## Approved-Tools Rule
- No generic `run_any` or `send_any` capabilities.
- Every automated action calls a named, server-side function with a fixed contract.
- Agent (when added later) inherits the logged-in user's permissions — cannot exceed what the user can do.

## Audit Principle
- Every status transition persists a revision row and/or comment row.
- Later: dedicated audit_logs table captures actor, action, target, timestamp, detail.
- No destructive action is ever silent — deletes log before and after state.

## What to Stop For
- If per-user RLS policies or role separation feel uncertain, stop and verify with a human before deploying to real users.
- Never store secrets in the repo. Use Vercel environment variables.