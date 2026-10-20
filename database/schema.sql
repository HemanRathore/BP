-- BP Enterprises: private PostgreSQL schema for the admin API.
-- Apply with Supabase SQL Editor (or use the migration already created for this project).

create table if not exists public.site_content (
  id smallint primary key check (id = 1),
  products jsonb not null default '[]'::jsonb,
  locations jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_sessions (
  token_hash char(64) primary key,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_sessions_expiry_idx on public.admin_sessions (expires_at);

create table if not exists public.admin_login_limits (
  bucket_hash char(64) primary key,
  failures integer not null default 0,
  window_start timestamptz not null default now(),
  locked_until timestamptz
);

create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  event text not null check (event = 'page_view'),
  path text not null check (char_length(path) between 1 and 180),
  created_at timestamptz not null default now()
);
create index if not exists site_events_created_path_idx on public.site_events (created_at desc, path);

create table if not exists public.site_event_rate (
  ip_hash char(64) not null,
  minute_start timestamptz not null,
  hits integer not null default 0,
  primary key (ip_hash, minute_start)
);

-- Supabase API roles cannot read or modify this private content. The Vercel
-- backend connects with a separate, least-privileged PostgreSQL role.
revoke all on public.site_content, public.admin_sessions, public.admin_login_limits, public.site_events, public.site_event_rate from anon, authenticated;
revoke all on sequence public.site_events_id_seq from anon, authenticated;

-- The initial record is intentionally empty. On first admin sign-in, the app
-- seeds it from the current static products and location config.
insert into public.site_content (id) values (1) on conflict (id) do nothing;

-- Least-privilege runtime account. The role is created without a password;
-- set its password securely in Supabase before using it in DATABASE_URL.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'bp_web_app') then
    execute 'create role bp_web_app login';
  end if;
end $$;
grant connect on database postgres to bp_web_app;
grant usage on schema public to bp_web_app;
grant select, update on public.site_content to bp_web_app;
grant select, insert, delete on public.admin_sessions to bp_web_app;
grant select, insert, update, delete on public.admin_login_limits to bp_web_app;
grant select, insert, delete on public.site_events to bp_web_app;
grant select, insert, update, delete on public.site_event_rate to bp_web_app;
grant usage, select on sequence public.site_events_id_seq to bp_web_app;
