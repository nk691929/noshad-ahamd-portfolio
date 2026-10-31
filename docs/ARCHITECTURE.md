# Architecture

Status: sections (step 4). Motion, case-study routes, SEO and CI are added in later steps.

## Data flow

`/content/*.ts` (typed, Zod-validated) -> server components in `src/components/sections/*` -> plain props -> small client components in `src/components/ui/*`.

- Client components never import `/content` or Zod; they receive plain props. This keeps Zod out of the client bundle.
- Unfilled `TODO(owner)` values are hidden in the UI with `real()` (`src/lib/content/real.ts`).
- Marketing copy (headings, intros, CTAs) lives in `content/sections.ts`; tiny UI chrome (aria-labels, form labels) stays in components.

## Folder map (src)

| Path                     | Purpose                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| `app/page.tsx`           | Composes the sections; revalidates hourly                               |
| `app/actions/contact.ts` | Server action for the contact form                                      |
| `components/sections/`   | One server component per page section                                   |
| `components/ui/`         | Primitives and small client components                                  |
| `lib/`                   | Content schemas, env validation, GitHub loader, contact schema, helpers |
| `instrumentation.ts`     | Validates env vars when the server starts                               |

## Server / client boundaries

Client components: `nav-bar`, `projects-grid` (+ `project-card` inside it), `contact-form`, `copy-email-button`, `rotating-role`, `theme-toggle`, `theme-provider`. Everything else is a server component.

## External data

- GitHub: `lib/github.ts` fetches the public API (revalidate 3600). Fallback: `data/github-snapshot.json` (write it with `pnpm github:snapshot`). The token is server-only.
- Contact: Resend REST API via `fetch` when `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` are set; otherwise a `mailto:` fallback link is returned.
