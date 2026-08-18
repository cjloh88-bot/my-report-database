# Authentication and roles

New public signups are always created as `engineer`. This is deliberate: users cannot grant themselves elevated privileges through metadata, forms, or direct API calls.

The first existing account is bootstrapped as `admin` by migration `0003`. Administrators manage later accounts from `/admin`: invite users, assign engineer/manager/admin access, suspend access, restore access, or permanently remove accounts.

Invitations use Supabase email setup links; administrators never choose or view passwords. The service-role credential is server-only. Every admin action re-verifies the caller's database role, and self-deletion, self-demotion, self-suspension, and removal of the final administrator are blocked.

Engineers own their projects and reports; managers can review any submitted report but cannot rewrite its engineering content. Administrators have full operational access and exclusive user control. Seed rows remain readable to signed-in users and are not owned by any account.

`audit_logs` is append-only for application users. Database triggers record creates, updates, and deletes for projects, stages, reports, revisions, and review comments.
