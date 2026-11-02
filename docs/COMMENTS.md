# Comments (Supabase)

Visitors can post a comment; it is stored UNAPPROVED and only appears after you approve it. Supabase keys stay on the
server (the form posts to a server action), and the browser never talks to Supabase directly.

## One-time setup

1. In Supabase create a project (free plan is fine).
2. **SQL Editor -> New query**, paste `supabase/comments.sql`, **Run**. This creates the `comments` table with row level
   security: visitors can submit comments (`approved = false`) and read only approved ones.
3. **Project Settings -> API**: copy the **Project URL** and the **anon public** key.
4. Add them as environment variables (names are exact):
   - `SUPABASE_URL` = the Project URL (for example `https://abcd1234.supabase.co`)
   - `SUPABASE_ANON_KEY` = the anon public key
     Locally put them in `.env.local`; on Vercel use **Settings -> Environment Variables**, then redeploy.
     Do NOT use the `service_role` key anywhere.
5. Open the site: the Comments section appears above Contact. (Until both variables exist it is hidden in production and shown as a disabled preview in development.)

## Moderating

Supabase **Table Editor -> comments**: tick `approved` to publish, delete the row (or untick) to remove. The site shows
new approved comments within about two minutes.

## Spam protection built in

Honeypot field, a 60 second cooldown cookie, no links allowed in name or message, length limits in both the app and the
database, and moderation by default. To publish instantly instead, change the insert policy to `with check (true)` and
the `approved` default to `true` (not recommended without a captcha).
