# ADR 0009: Device tiers for 3D, and server-side comment writes

- Status: accepted
- Context: iPhone Safari crashed while scrolling and mobile Lighthouse scored 43 to 57. The page carried a WebGL scene,
  about 25 large rotating layers, about 40 backdrop blurs and several simultaneous videos on every device. Separately,
  comments were stored unapproved and the list showed approved rows only, and writes relied on a public insert policy.
- Decision: WebGL runs only on desktop-class devices; phones and tablets get a CSS laptop and lighter effects. Videos are
  mounted only while near the viewport. Comments are read through a no-store API route with the publishable key (RLS:
  approved rows, public columns only) and written by a server action with the secret key (validation, rate limit,
  unique submission id). No `@supabase/ssr` or `supabase-js`: there are no user sessions and no browser client.
- Consequences: phones lose the WebGL laptop (the CSS laptop keeps the story); `SUPABASE_SECRET_KEY` becomes a required
  server variable for posting; the old public insert policy is dropped by the hardening migration.
