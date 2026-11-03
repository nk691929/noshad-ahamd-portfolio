-- Comments hardening. Safe to run more than once. Non-destructive: no rows are deleted or rewritten.
--
-- Model after this migration:
--   * Public visitors (anon / authenticated roles) can only READ approved comments, and only the public columns.
--   * Nobody can insert, update or delete through the public API. The website writes comments from a server action that
--     uses the SECRET key (service role), which bypasses RLS and never reaches the browser.
--   * Moderation = the Supabase dashboard (Table Editor), which also runs as an admin role.

-- 1) Columns used for spam control and for de-duplicating double submissions
alter table public.comments add column if not exists ip_hash text;           -- salted SHA-256 prefix of the visitor IP
alter table public.comments add column if not exists submission_id uuid;     -- one per form submission

create unique index if not exists comments_submission_id_key
  on public.comments (submission_id) where submission_id is not null;

create index if not exists comments_ip_hash_created_idx
  on public.comments (ip_hash, created_at desc) where ip_hash is not null;

-- 2) No links in names or messages (spam). NOT VALID = enforced for new rows only, existing rows are not scanned.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'comments_no_links_chk' and conrelid = 'public.comments'::regclass
  ) then
    alter table public.comments
      add constraint comments_no_links_chk
      check (name !~* '(https?://|www\.)' and message !~* '(https?://|www\.)') not valid;
  end if;
end $$;

-- 3) Row Level Security: public read of approved rows only; no public writes
alter table public.comments enable row level security;

drop policy if exists "submit comment for review" on public.comments;         -- old public insert policy
drop policy if exists "read approved comments" on public.comments;            -- old name
drop policy if exists "public can read approved comments" on public.comments;

create policy "public can read approved comments"
  on public.comments for select
  to anon, authenticated
  using (approved = true);

-- 4) Table privileges: nothing by default, then SELECT on the public columns only (ip_hash / submission_id stay private)
revoke all on table public.comments from anon, authenticated;
grant select (id, created_at, name, message, approved) on table public.comments to anon, authenticated;

-- 5) OPTIONAL, run by hand once: publish the comments that were submitted while approval was required.
--    Review them first in the Table Editor; this makes every currently hidden comment public.
-- update public.comments set approved = true where approved = false;
