# Comments (Supabase)

## How it works

- **Reading:** the browser calls `GET /api/comments` (when the Comments section nears the screen). The route reads the
  `comments` table with the PUBLISHABLE key. Row Level Security lets that key see approved rows only, and only the
  columns `id, created_at, name, message, approved`. Results are never cached, so a refresh always shows what is stored.
- **Writing:** the form calls a server action. It validates, rate limits and inserts with the SECRET key, which exists
  only on the server. Visitors cannot insert, update or delete through the public API at all.
- **Showing a new comment:** the action returns the stored row and the list shows it immediately. After a refresh it is
  fetched from the database like every other comment.
- **No double posts:** each form submission carries one id (`submission_id`, unique in the database). A double tap or a
  retry returns "already received" and never creates a second row.
- **Spam control:** honeypot field, 30 second cooldown cookie, 3 comments per visitor per 10 minutes (salted hash of the
  IP, never stored raw), no links, length limits in the app and in the database.
- **Moderation:** comments are published immediately. To hide one, untick `approved` in Supabase -> Table Editor. To
  require approval first, set `COMMENTS_REQUIRE_APPROVAL=true` (new comments then stay hidden until you tick `approved`).

## Why the earlier version "lost" comments

New comments were stored with `approved = false` and the list shows approved rows only, so every comment waited for a
manual approval that never came. They were not lost: open Table Editor -> comments and look for rows with `approved`
unticked. To publish the ones already submitted, run the optional last statement in the hardening migration.

## One-time setup

1. Supabase -> SQL Editor: run `supabase/migrations/20261101000000_comments_init.sql`, then
   `supabase/migrations/20261103000000_comments_hardening.sql`. Both are safe to run more than once and delete nothing.
2. Supabase -> Project Settings -> API: copy the Project URL, the publishable key (or the legacy anon key) and the
   SECRET key (or the legacy service_role key).
3. Set the variables locally (`.env.local`) and on Vercel (Settings -> Environment Variables, then redeploy):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
   (the old names `SUPABASE_URL` and `SUPABASE_ANON_KEY` still work). Never prefix the secret key with `NEXT_PUBLIC_`.
4. Verify against the real project: `node --env-file=.env.local scripts/check-supabase.mjs --write`
   (add `pnpm build` first so the script can also scan the browser bundle for leaked keys).

## If a secret key was ever committed or pasted somewhere public

Supabase -> Project Settings -> API: create a new secret key, update `SUPABASE_SECRET_KEY` in Vercel and `.env.local`,
redeploy, then delete the old key. If it is in git history, rotating is what protects you; rewriting history alone does not.
