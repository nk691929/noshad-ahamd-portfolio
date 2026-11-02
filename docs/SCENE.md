# 3D scene guide

## What it is

One fixed WebGL canvas behind the page. Stages (see `STAGES` in `src/lib/scene/timeline.ts`):
0 hero (laptop opens, right of the headline) → 1 about (camera swings round and above, scene dims) → 2 skills (pull back, the laptop becomes the core of the technology constellation) → 3 showcase start → 4 showcase end (closest camera; the screen changes per project) → 5 recede (hidden behind the project grids) → 6 pre-contact (hidden) → 7 contact (everything converges into an emerald focal point).

## Files

| File                                      | Role                                                              |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `lib/scene/timeline.ts`                   | Pure maths + the `STAGES` table (unit-tested)                     |
| `lib/scene/pivots.ts`                     | Measures where each stage is reached, from real section positions |
| `components/scene/rig.tsx`                | Camera + scroll → params every frame                              |
| `components/scene/laptop.tsx`             | Procedural laptop, screen crossfade between slides                |
| `components/scene/tech-constellation.tsx` | Orbiting technology plaques + links                               |
| `components/scene/finale.tsx`             | Depth dust + emerald focal point                                  |
| `components/scene/scene.tsx`              | Canvas, quality settings, pausing                                 |
| `components/scene/scene-loader.tsx`       | Lazy load, fail-safe fallback                                     |
| `components/ui/showcase-stage.tsx`        | Pinned project text (left) in sync with the laptop screen         |
| `styles/scene.css`                        | Layout switches keyed on `html[data-scene]`                       |

## Tuning

- Camera path, where the laptop sits, how dim the scene is behind text: edit the objects in `STAGES`. Each has desktop (`axD`, `ayD`) and phone (`axP`, `ayP`) anchors (0..1 of screen width/height).
- Time per project in the showcase: `STEP_SVH` in `showcase-stage.tsx` (default 85 svh each).
- Number of featured projects: `SHOWCASE_COUNT` in `lib/scene-data.ts`.
- Which technologies orbit: the core and proficient skills in `content/skills.ts`, interleaved across groups, max 12 (8 on phones).
- Quality: pixel-ratio caps in `scene.tsx` (1.75 desktop, 1.25 phones, falls to 1 automatically if the frame rate drops), particle counts (140 / 70).
- Colours: `lib/scene/palette.ts` (mirrors the CSS accent tokens).

## Real screenshots on the laptop

Name files after the project slug: `public/media/<slug>.jpg` (16:9 best; portrait phone screenshots are centred, not cropped). Use `pnpm capture` for websites (docs/MEDIA_GUIDE.md). Projects without a screenshot show a generated title card.

## When it turns off

No WebGL, reduced motion, data saver, very low memory or 2 or fewer CPU cores, a module error, or a lost WebGL context. The original design (portrait in the hero, no pinned showcase) is shown instead.

## Checking it by hand

1. Scroll slowly top to bottom, then back up: every move must reverse, with no jumps.
2. Hero text, buttons and the About, Skills and showcase text stay readable over the scene in both themes.
3. Windows: Settings → Accessibility → Visual effects → Animation effects off → reload: no 3D, original layout.
4. Phone: Chrome remote debugging → Performance panel; aim for a steady 30 fps or better while scrolling.
5. Chrome DevTools → Rendering → "Emulate prefers-reduced-motion" and "Disable WebGL" (chrome://flags) both give the static design.
