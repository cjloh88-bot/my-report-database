create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_name text,
  status text not null default 'active',
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  order_num int not null default 0,
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage_id uuid not null references stages(id) on delete cascade,
  title text not null,
  content text,
  submitted_by_name text,
  reviewed_by_name text,
  status text not null default 'draft',
  due_date date,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists report_revisions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  revision_number int not null default 1,
  content text,
  changed_by_name text,
  change_summary text,
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists review_comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  author_name text,
  comment_text text,
  action text not null default 'comment',
  user_id uuid,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;
alter table stages enable row level security;
alter table reports enable row level security;
alter table report_revisions enable row level security;
alter table review_comments enable row level security;

drop policy if exists "projects_v1_read" on projects;
create policy "projects_v1_read" on projects for select using (true);
drop policy if exists "projects_v1_write" on projects;
create policy "projects_v1_write" on projects for all using (true) with check (true);

drop policy if exists "stages_v1_read" on stages;
create policy "stages_v1_read" on stages for select using (true);
drop policy if exists "stages_v1_write" on stages;
create policy "stages_v1_write" on stages for all using (true) with check (true);

drop policy if exists "reports_v1_read" on reports;
create policy "reports_v1_read" on reports for select using (true);
drop policy if exists "reports_v1_write" on reports;
create policy "reports_v1_write" on reports for all using (true) with check (true);

drop policy if exists "report_revisions_v1_read" on report_revisions;
create policy "report_revisions_v1_read" on report_revisions for select using (true);
drop policy if exists "report_revisions_v1_write" on report_revisions;
create policy "report_revisions_v1_write" on report_revisions for all using (true) with check (true);

drop policy if exists "review_comments_v1_read" on review_comments;
create policy "review_comments_v1_read" on review_comments for select using (true);
drop policy if exists "review_comments_v1_write" on review_comments;
create policy "review_comments_v1_write" on review_comments for all using (true) with check (true);

insert into projects (id, name, description, owner_name, status) values
  ('a1000000-0000-0000-0000-000000000001', 'Pump Redesign', 'Redesign of the MX-12 industrial pump for improved efficiency', 'Sarah Chen', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'Heat Exchanger Upgrade', 'Replace tube bundles and upgrade control system', 'Marcus Patel', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'Compressor Housing Fatigue Study', 'Investigate and resolve housing crack reports from field', 'Lisa Tran', 'active')
on conflict (id) do nothing;

insert into stages (id, project_id, name, order_num) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Design Review', 1),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Prototype', 2),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Testing', 3),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Design Review', 1),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Installation', 2),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'Field Investigation', 1),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'Root Cause Analysis', 2)
on conflict (id) do nothing;

insert into reports (id, project_id, stage_id, title, content, submitted_by_name, reviewed_by_name, status, due_date, submitted_at, reviewed_at) values
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Pump Redesign — Design Review Report', 'This report covers the initial design review for the MX-12 pump redesign. Key findings: impeller geometry revised for 15% efficiency gain, housing material changed to 316SS, bearing assembly simplified. Risk assessment: medium. Budget: on track.', 'Sarah Chen', 'David Okoye', 'approved', '2024-06-15', '2024-06-10 14:30:00+00', '2024-06-12 09:15:00+00'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Pump Redesign — Prototype Build Report', 'Prototype built with revised impeller. Initial bench testing shows 12% efficiency improvement (target 15%). Vibration levels within spec. Recommend proceeding to full testing with minor impeller trim adjustment.', 'Sarah Chen', NULL, 'submitted', '2024-07-20', '2024-07-18 10:00:00+00', NULL),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'Heat Exchanger — Design Review Report', 'Design review for tube bundle replacement. New bundle uses enhanced surface tubing. Control system upgrade specs attached. No risk assessment section included yet.', 'Marcus Patel', 'David Okoye', 'returned', '2024-07-10', '2024-07-08 11:00:00+00', '2024-07-09 15:30:00+00'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006', 'Compressor Housing — Field Investigation Report', 'Site visit to Plant 3 completed. Three housings inspected, all show hairline cracks near mounting flange. Photos and measurements attached. Recommend accelerated root cause analysis.', 'Lisa Tran', NULL, 'draft', '2024-08-01', NULL, NULL)
on conflict (id) do nothing;

insert into report_revisions (id, report_id, revision_number, content, changed_by_name, change_summary) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 1, 'This report covers the initial design review for the MX-12 pump redesign. Key findings: impeller geometry revised for 15% efficiency gain, housing material changed to 316SS, bearing assembly simplified. Risk assessment: medium. Budget: on track.', 'Sarah Chen', 'Initial submission'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 2, 'This report covers the initial design review for the MX-12 pump redesign. Key findings: impeller geometry revised for 15% efficiency gain, housing material changed to 316SS, bearing assembly simplified. Risk assessment: medium. Budget: on track. Added: supplier qualification plan for new housing material.', 'Sarah Chen', 'Added supplier qualification plan after manager feedback'),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 1, 'Design review for tube bundle replacement. New bundle uses enhanced surface tubing. Control system upgrade specs attached.', 'Marcus Patel', 'Initial submission'),
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 1, 'Site visit to Plant 3 completed. Three housings inspected, all show hairline cracks near mounting flange. Photos and measurements attached. Recommend accelerated root cause analysis.', 'Lisa Tran', 'Initial draft')
on conflict (id) do nothing;

insert into review_comments (id, report_id, author_name, comment_text, action) values
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'David Okoye', 'Good comprehensive review. Please add supplier qualification plan for the new 316SS housing material before final approval.', 'comment'),
  ('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'David Okoye', 'Supplier qualification plan added. Report approved. Proceed to prototype stage.', 'approve'),
  ('e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'David Okoye', 'Missing risk assessment section. Please add risk assessment and mitigation plan, then resubmit.', 'return')
on conflict (id) do nothing;