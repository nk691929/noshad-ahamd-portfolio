# ADR 0004: Contact via server action + REST, GitHub via server fetch with snapshot fallback

- Status: accepted
- Context: no secrets in the browser; the site must keep working with no env vars or when the GitHub API is rate-limited.
- Decision: contact uses a Next.js server action, Zod validation, a honeypot field and the Resend REST API called with `fetch` (no SDK dependency); without env vars it returns a `mailto:` link. The GitHub block is a server component using a revalidating `fetch`, falling back to a committed snapshot and finally to a plain profile link.
- Alternatives: Resend SDK (extra dependency); client-side GitHub fetch (exposes rate limits/tokens); contribution heatmap (needs a GraphQL token, skipped for now).
- Consequences: no rate limiting beyond the honeypot yet (add in a later hardening step if spam appears).
