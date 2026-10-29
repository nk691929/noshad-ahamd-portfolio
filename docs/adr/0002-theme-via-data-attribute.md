# ADR 0002: Theme via `data-theme` attribute and CSS variables

- Status: accepted
- Context: need dark-first plus light theme, no flash on load, and the whole look re-skinnable from one file.
- Decision: tokens are CSS variables in `tokens.css`; `next-themes` toggles `data-theme` on `<html>` (default dark, `enableSystem=false`); Tailwind v4 `@theme inline` maps tokens to utilities; Tailwind `dark:` is wired to the attribute with `@custom-variant`.
- Consequences: components use token-backed utilities and rarely need `dark:`. OS preference is ignored by design (dark-first).
