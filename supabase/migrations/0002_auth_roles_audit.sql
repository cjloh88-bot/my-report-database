-- Sprint 4/5: authenticated roles, owner-scoped writes, and append-only memory.
-- Seed rows remain readable but immutable unless acted on by a manager workflow.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'engineer' check (role in ('engineer', 'manager')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text not null default 'System',
  action text not null,
  target_type text not null,
  target_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_target_idx on audit_logs(target_type, target_id, created_at desc);
create index if not exists audit_logs_actor_idx on audit_logs(actor_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name, role)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, ''), '@', 1)), 'engineer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into profiles (id, display_name, role)
select id, coalesce(nullif(raw_user_meta_data ->> 'display_name', ''), split_part(coalesce(email, ''), '@', 1)), 'engineer'
from auth.users on conflict (id) do nothing;

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then raise exception 'Role changes require an administrator'; end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists guard_profile_role_trigger on profiles;
create trigger guard_profile_role_trigger before update on profiles for each row execute function public.guard_profile_role();

create or replace function public.guard_report_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare actor_role text := public.current_role();
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if new.project_id is distinct from old.project_id or new.stage_id is distinct from old.stage_id or
     new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at then
    raise exception 'Report ownership and relationships are immutable';
  end if;
  if actor_role = 'manager' then
    if new.title is distinct from old.title or new.content is distinct from old.content or
       new.submitted_by_name is distinct from old.submitted_by_name or new.due_date is distinct from old.due_date or
       new.submitted_at is distinct from old.submitted_at then
      raise exception 'Managers may only review report status';
    end if;
    if not ((old.status = 'submitted' and new.status = 'under_review') or
            (old.status = 'under_review' and new.status in ('approved','returned'))) then
      raise exception 'Invalid manager status transition';
    end if;
  elsif actor_role = 'engineer' and old.user_id = auth.uid() then
    if new.reviewed_by_name is distinct from old.reviewed_by_name or new.reviewed_at is distinct from old.reviewed_at then
      raise exception 'Engineers cannot set review decisions';
    end if;
    if not ((old.status = 'draft' and new.status in ('draft','submitted')) or
            (old.status = 'returned' and new.status = 'draft')) then
      raise exception 'Invalid engineer status transition';
    end if;
  else
    raise exception 'Not permitted to update this report';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_report_update_trigger on reports;
create trigger guard_report_update_trigger before update on reports for each row execute function public.guard_report_update();

create or replace function public.write_audit_log()
returns trigger language plpgsql security definer set search_path = public as $$
declare row_data jsonb; row_id uuid; actor_label text;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  row_id := (row_data ->> 'id')::uuid;
  select coalesce(nullif(display_name,''), 'Authenticated user') into actor_label from profiles where id = auth.uid();
  insert into audit_logs(actor_id, actor_name, action, target_type, target_id, detail)
  values (auth.uid(), coalesce(actor_label, case when auth.uid() is null then 'System' else 'Authenticated user' end),
          lower(tg_op), tg_table_name, row_id, jsonb_build_object('before', case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end, 'after', case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end));
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

do $$ declare table_name text; begin
  foreach table_name in array array['projects','stages','reports','report_revisions','review_comments'] loop
    execute format('drop trigger if exists audit_%I on %I', table_name, table_name);
    execute format('create trigger audit_%I after insert or update or delete on %I for each row execute function public.write_audit_log()', table_name, table_name);
  end loop;
end $$;

alter table profiles enable row level security;
alter table audit_logs enable row level security;

drop policy if exists "projects_v1_read" on projects; drop policy if exists "projects_v1_write" on projects;
drop policy if exists "stages_v1_read" on stages; drop policy if exists "stages_v1_write" on stages;
drop policy if exists "reports_v1_read" on reports; drop policy if exists "reports_v1_write" on reports;
drop policy if exists "report_revisions_v1_read" on report_revisions; drop policy if exists "report_revisions_v1_write" on report_revisions;
drop policy if exists "review_comments_v1_read" on review_comments; drop policy if exists "review_comments_v1_write" on review_comments;

create policy "authenticated_read_projects" on projects for select to authenticated using (true);
create policy "engineers_insert_projects" on projects for insert to authenticated with check (public.current_role()='engineer' and user_id=auth.uid());
create policy "owners_update_projects" on projects for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "owners_delete_projects" on projects for delete to authenticated using (user_id=auth.uid());

create policy "authenticated_read_stages" on stages for select to authenticated using (true);
create policy "owners_insert_stages" on stages for insert to authenticated with check (user_id=auth.uid() and exists(select 1 from projects p where p.id=project_id and p.user_id=auth.uid()));
create policy "owners_update_stages" on stages for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

create policy "authenticated_read_reports" on reports for select to authenticated using (true);
create policy "engineers_insert_reports" on reports for insert to authenticated with check (public.current_role()='engineer' and user_id=auth.uid());
create policy "owners_or_managers_update_reports" on reports for update to authenticated using (user_id=auth.uid() or public.current_role()='manager') with check (user_id=auth.uid() or public.current_role()='manager');
create policy "owners_delete_reports" on reports for delete to authenticated using (user_id=auth.uid());

create policy "authenticated_read_revisions" on report_revisions for select to authenticated using (true);
create policy "owners_insert_revisions" on report_revisions for insert to authenticated with check (user_id=auth.uid() and exists(select 1 from reports r where r.id=report_id and r.user_id=auth.uid()));

create policy "authenticated_read_comments" on review_comments for select to authenticated using (true);
create policy "managers_insert_comments" on review_comments for insert to authenticated with check (public.current_role()='manager' and user_id=auth.uid());

create policy "users_read_profiles" on profiles for select to authenticated using (true);
create policy "users_update_own_profile" on profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
create policy "authenticated_read_audit" on audit_logs for select to authenticated using (true);

revoke insert, update, delete on audit_logs from anon, authenticated;
grant select on audit_logs to authenticated;
