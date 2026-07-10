create extension if not exists "pgcrypto";

create table if not exists public.stories (
  id         uuid primary key default gen_random_uuid(),
  owner_id   text,
  slug       text unique not null,
  answers    jsonb not null,
  story      jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists stories_owner_id_idx on public.stories (owner_id);

alter table public.stories enable row level security;

drop policy if exists "Public can read stories" on public.stories;

create policy "Public can read stories"
  on public.stories
  for select
  to anon, authenticated
  using (true);
