-- The application accesses links only from server-side handlers with the
-- Supabase service role key. Keep browser roles locked down while making the
-- server role's required privileges explicit for projects with hardened
-- default grants.
grant usage on schema public to service_role;
grant select, insert on table public.links to service_role;
grant usage, select on sequence public.links_id_seq to service_role;
