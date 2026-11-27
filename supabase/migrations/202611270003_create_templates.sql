-- Shared internal templates. Browser clients never access this table directly;
-- the server-side API uses the service role key.
create table if not exists public.templates (
  id varchar(120) primary key,
  name varchar(200) not null,
  description varchar(500) not null default '',
  content text not null,
  built_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.templates enable row level security;
revoke all on table public.templates from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.templates to service_role;

insert into public.templates (id, name, description, content, built_in)
values (
  'chatwork-task-report',
  'Chatwork · Task report',
  'Report tiến độ một task theo format [info] của Chatwork.',
  $template$[info][title]Task report: {{task}}[/title]
Spec: {{spec}}
Design: {{design}}

Pull request: {{pull_request}}
PR summary:
- {{pr_summary}}
- {{impact}}

Message:
- {{done}}
- {{remaining}}
- {{confirmation}}
[/info]$template$,
  true
)
on conflict (id) do nothing;
