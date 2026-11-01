# Content guide

All copy and data live in `/content`. Components never hold hard-coded text. Every file is validated by Zod
(`src/lib/content/schemas.ts`), so a typo fails `pnpm test` / `pnpm build` instead of breaking the page.

## Add a project (2 minutes)

1. Open `content/projects.ts`, copy an existing entry, change `slug` (kebab-case), `title`, `summary`, `tags`, `stack`.
2. Fill `links`, `role`, `period`, `cover` (or leave the `todo(...)` placeholders).
3. Optional case study: set `caseStudy: true`, create `content/case-studies/<slug>.mdx` with frontmatter `title` and `summary`.
4. Run `pnpm test`.

Allowed tags: Flutter, Web, Android, Mobile, AI (edit `PROJECT_TAGS` in schemas.ts to add more).

## Add a skill

Add an object to `content/skills.ts`: `name`, `group` (Mobile, Backend, Web, Tools), `tier` (core, proficient, familiar) and
`confirmed: true` once you have decided the tier. No percentages.

## Edit profile, socials, experience

`content/profile.ts` (hero, about, contact info), `content/socials.ts`, `content/experience.ts`.

## Placeholders

Never invent facts. Unknown values use `todo("what is needed")` from `src/lib/content/todo.ts`, which produces a
`TODO(owner): ...` string. Run `pnpm todo` to list everything still to fill. The UI must hide or flag placeholders (step 4).

## Case-study MDX

Files in `content/case-studies/`. Filename = project slug. Frontmatter requires `title` and `summary`. MDX can execute JavaScript,
so only the owner edits these files.

# Content guide addendum (project fields)

Append this to `docs/CONTENT_GUIDE.md` (the commands in the step message do it for you, then this file can be deleted).

## Optional project fields

- `client`: client name for client work. Get the client's permission before publishing it.
- `status`: `live`, `in-progress` or `archived`. Omit when unknown.

## Privacy

The site is public. Never put a phone number in `/content` (`tests/privacy.test.ts` enforces this). Use a résumé copy
without a phone number for `/public/resume.pdf`.

# Content guide addendum (step 4)

Append to `docs/CONTENT_GUIDE.md`, then delete this file.

## Project order

Each project has a unique `rank` (1 = shown first). The first card is large and the second is wide. Re-rank by editing the numbers; `pnpm test` fails on duplicates.

## Section headings and CTAs

Edit `content/sections.ts`. Components contain no marketing copy.

## What the UI hides

Any value that is still `todo(...)` is hidden (links, summaries, photo, availability). Fill it and it appears.

# Content guide addendum (contact line and form)

Append to `docs/CONTENT_GUIDE.md`, then delete this file.

## Contact line and form options

Edit `content/contact.ts`:

- `phone`: digits only with the leading 0 (for example `03001234567`); `phoneDisplay`: how it is shown; `countryCode`: `92` for Pakistan. WhatsApp and call links are generated from these.
- `whatsappGreeting`: first line of the pre-filled WhatsApp message.
- `options.projectTypes`, `options.budgets`, `options.timelines`: the pill choices in the form. Plain text. The server only accepts values listed here. Keep one budget option like "I will decide later".

This is the ONLY content file allowed to contain a phone number (`tests/privacy.test.ts` enforces it). Never put a personal number in `/content`.

## Recording a project preview

Run `pnpm capture <slug>=<url>` (see docs/MEDIA_GUIDE.md). The portfolio itself is the project `portfolio-site`.
