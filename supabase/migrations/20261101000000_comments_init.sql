-- Baseline for the comments table (idempotent). If you already ran the earlier supabase/comments.sql, this changes
-- nothing. All existing rows are kept.
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
