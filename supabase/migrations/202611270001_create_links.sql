-- Public link records. No user table or auth is required for the MVP.
create table if not exists public.links (
  id bigint generated always as identity primary key,
  code varchar(7) not null unique,
  destination_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists links_created_at_idx on public.links (created_at desc);

alter table public.links enable row level security;

-- Browser clients receive no table access. Server-side service role is used only
-- in API/redirect handlers and must never be exposed as NEXT_PUBLIC_*.
revoke all on table public.links from anon, authenticated;
