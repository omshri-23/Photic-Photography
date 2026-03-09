create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_created_at
  on public.contact_messages (created_at desc);

create index if not exists idx_contact_messages_status
  on public.contact_messages (status);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  media_type text not null check (media_type in ('image', 'video')),
  category_slug text not null,
  media_url text not null,
  thumbnail_url text not null default '',
  featured boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_portfolio_items_category
  on public.portfolio_items (category_slug);

create index if not exists idx_portfolio_items_status
  on public.portfolio_items (status);

create index if not exists idx_portfolio_items_featured
  on public.portfolio_items (featured);

alter table public.contact_messages enable row level security;
alter table public.portfolio_items enable row level security;

drop policy if exists "deny_anon_reads_contact_messages" on public.contact_messages;
create policy "deny_anon_reads_contact_messages"
on public.contact_messages
for select
to anon
using (false);

drop policy if exists "allow_anon_insert_contact_messages" on public.contact_messages;
create policy "allow_anon_insert_contact_messages"
on public.contact_messages
for insert
to anon
with check (true);

drop policy if exists "deny_anon_all_portfolio_items" on public.portfolio_items;
create policy "deny_anon_all_portfolio_items"
on public.portfolio_items
for all
to anon
using (false)
with check (false);
