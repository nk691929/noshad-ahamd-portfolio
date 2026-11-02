-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Creates the comments table. Visitors can SUBMIT comments (unapproved) and READ only approved ones.

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 60),
  message text not null check (char_length(message) between 3 and 500),
  approved boolean not null default false
);

create index if not exists comments_approved_created_idx
  on public.comments (approved, created_at desc);

alter table public.comments enable row level security;

drop policy if exists "read approved comments" on public.comments;
create policy "read approved comments"
  on public.comments for select
  to anon
  using (approved = true);

drop policy if exists "submit comment for review" on public.comments;
create policy "submit comment for review"
  on public.comments for insert
  to anon
  with check (approved = false);

-- To approve a comment: Table Editor -> comments -> tick "approved" on the row.
-- To hide or delete one: untick "approved" or delete the row.
