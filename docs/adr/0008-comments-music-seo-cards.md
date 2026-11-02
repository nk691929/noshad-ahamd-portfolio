# ADR 0008: Supabase comments via REST, generated ambient music, central SEO, revolving-light cards

- Status: accepted
- Comments: stored in Supabase through its REST API using `fetch` (no SDK) from a server action; keys are server-only; RLS allows anonymous insert of unapproved rows and read of approved rows; moderation in the dashboard.
- Music: never autoplays; a generated Web Audio pad (no file, no licence) by default, or `public/audio/ambient.*` when present; fades, pauses on hidden tabs, always has a visible play/pause button.
- SEO: one module (`lib/seo.ts`) feeds metadata and JSON-LD; the Open Graph image is generated at build time.
- Cards: a masked, rotating conic gradient (`.ring`) gives a revolving light; only the gradient layer rotates; static under reduced motion. TiltCard adds touch press-tilt so phones get the 3D feel too.
- Hanging portrait: a pendulum spring (transform only) with `touch-action: pan-y` so scrolling is never blocked.
