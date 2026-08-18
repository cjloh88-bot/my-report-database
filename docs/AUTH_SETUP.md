# Authentication and roles

New signups are always created as `engineer`. This is deliberate: users cannot grant themselves manager privileges through metadata, forms, or direct API calls.

To promote a verified user, an administrator runs this in the Supabase SQL editor:

```sql
update public.profiles
set role = 'manager'
where id = (select id from auth.users where email = 'manager@example.com');
```

The profile trigger allows role changes only from an administrative database context. Engineers own their projects and reports; managers can review any submitted report but cannot rewrite its engineering content. Seed rows remain readable to signed-in users and are not owned by any account.

`audit_logs` is append-only for application users. Database triggers record creates, updates, and deletes for projects, stages, reports, revisions, and review comments.
