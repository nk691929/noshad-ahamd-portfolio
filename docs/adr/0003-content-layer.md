# ADR 0003: Typed content files + Zod, MDX via next-mdx-remote

- Status: accepted
- Context: the owner must edit content without touching components; unknown facts must never be invented; case studies need rich text.
- Decision: structured data lives in `/content/*.ts`, validated at import by Zod schemas in `src/lib/content/schemas.ts`. Unknown values are `TODO(owner)` placeholders (`todo()` helper). Case studies are MDX files rendered with `next-mdx-remote/rsc`, frontmatter parsed by `gray-matter` and validated by Zod.
- Alternatives: `@next/mdx` (needs build-time config and static imports, awkward with dynamic slugs and Turbopack); a CMS (overkill, adds secrets and cost).
- Consequences: invalid content fails fast in tests/build. MDX can run JS, so only trusted owner content is allowed there.
