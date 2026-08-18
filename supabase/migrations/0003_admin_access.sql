-- Administrator access and server-side user management support.

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('engineer', 'manager', 'admin'));

-- Bootstrap the earliest verified account only when no administrator exists.
update profiles set role = 'admin'
where id = (
  select p.id from profiles p join auth.users u on u.id = p.id
  where not exists (select 1 from profiles where role = 'admin')
  order by u.created_at asc limit 1
);

create or replace function public.guard_report_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare actor_role text := public.current_role();
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if actor_role = 'admin' then return new; end if;
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

create policy "admins_all_projects" on projects for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');
create policy "admins_all_stages" on stages for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');
create policy "admins_insert_reports" on reports for insert to authenticated with check (public.current_role()='admin');
create policy "admins_delete_reports" on reports for delete to authenticated using (public.current_role()='admin');
create policy "admins_all_revisions" on report_revisions for all to authenticated using (public.current_role()='admin') with check (public.current_role()='admin');

drop policy if exists "owners_or_managers_update_reports" on reports;
create policy "owners_managers_admins_update_reports" on reports for update to authenticated
  using (user_id=auth.uid() or public.current_role() in ('manager','admin'))
  with check (user_id=auth.uid() or public.current_role() in ('manager','admin'));

drop policy if exists "managers_insert_comments" on review_comments;
create policy "reviewers_insert_comments" on review_comments for insert to authenticated
  with check (public.current_role() in ('manager','admin') and user_id=auth.uid());

