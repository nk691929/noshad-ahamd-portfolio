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
