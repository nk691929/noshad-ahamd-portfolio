# Design system

Status: tokens and theme (step 2). Components and motion rules are added in later steps.

## Where things live

| Concern                                             | File                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| All tokens (color, radius, shadow, spacing, motion) | `src/styles/tokens.css`                                                   |
| Tailwind theme mapping, fluid type, utilities       | `src/styles/globals.css`                                                  |
| Fonts (display, text, mono)                         | `src/lib/fonts.ts`                                                        |
| Theme provider / toggle                             | `src/components/theme-provider.tsx`, `src/components/ui/theme-toggle.tsx` |

## Re-skinning

Edit **only** `tokens.css`. Dark is the default (`:root`); light overrides live in `:root[data-theme="light"]`.
Run `pnpm test`: `tests/tokens.test.ts` fails if key text/background pairs drop below WCAG AA (4.5:1).

## Using tokens in components

Use Tailwind utilities backed by tokens: `bg-bg`, `bg-bg-elevated`, `bg-surface`, `border-border`,
`text-fg`, `text-fg-muted`, `text-accent`, `rounded-md`, `shadow-glow`, `font-display`, `font-mono`,
`text-hero`, `text-h1`, `text-h2`, `text-h3`. Shared classes: `.glass`, `.text-gradient`, `.bg-accent-grad`.
Never hard-code hex colors in components.

## Accessibility notes

- `--accent-text` is the accent for text (AA on the background). `--accent-1/--accent-2` are for fills, borders and glow.
- The gradient fill has no single text color that passes AA across its full range. Primary buttons (step 4) will use a solid surface with a gradient border/glow, or a fixed AA-safe label color per theme.
- A global `:focus-visible` ring and a `prefers-reduced-motion` baseline are in `globals.css`.

## Theme behavior

`next-themes` sets `data-theme` on `<html>` via a blocking script (no flash). Default is dark, OS preference is ignored, the choice persists.

# Design system addendum: motion rules (step 5)

Append to `docs/DESIGN_SYSTEM.md`, then delete this file.

## Motion rules

1. Animate only `transform` and `opacity`. No animating width, height, top/left, blur or box-shadow.
2. Define animations ONLY in `src/lib/motion` (`tokens.ts` mirrors `tokens.css`; `variants.ts` holds presets). Never inline durations or easings in components.
3. Every preset needs a `full` and a `reduced` variant. Reduced = opacity only. `tests/motion.test.ts` enforces it.
4. Effects that depend on a mouse (cursor, tilt, magnetic) must check `useFinePointer()` and `useReduced()`.
5. Heavy effects load lazily (Lenis in an effect, the cursor via `next/dynamic` after idle).
6. The hero uses CSS (`.rise`) so LCP never waits for hydration; use Motion for everything below the fold.

## Recipes

- Reveal on scroll: wrap content in `<Reveal>`; staggered groups use `<Stagger>` with `<StaggerItem>` children (items must be inside a Stagger).
- Heading: render `<SplitText text="..." />` inside the heading element.
- New preset: add it to `presets` in `variants.ts` with both variants, then `pickVariants("name", reduced)`.
- Elements with a hidden initial state carry `data-reveal`, so the `<noscript>` rule in `layout.tsx` shows them without JavaScript.

# Design system addendum (light theme, project groups, icons)

Append to `docs/DESIGN_SYSTEM.md`, then delete this file.

## Light theme

- Tokens live in `tokens.css` (`:root[data-theme="light"]`): cool-tinted base `#f4f7fb`, frosted white glass `--surface`, deeper accent. Contrast is enforced by `tests/tokens.test.ts`.
- `src/styles/light.css` adds the fixed gradient mesh (`body::before`, one static layer so scrolling never repaints it), soft glass shadows and faint white bands behind the Skills and Experience sections. It also holds the dotted hero grid and teal blob used in both themes.
- `--accent-3` (teal) matches the portrait photo and is only used for glows.

## Project groups

Projects are split into "Mobile apps" and "Websites" by tag: a project with a Flutter, Android or Mobile tag is an app; everything else is a website (`groupOf` in `lib/projects.ts`). Titles and intros: `content/sections.ts`.

## Icons

`src/app/icon.png`, `src/app/apple-icon.png` and `src/app/favicon.ico` are generated from the portrait; Next.js links them automatically. `src/app/manifest.ts` supplies the home-screen name and icons. To change the icon, replace those three files (keep the names).
