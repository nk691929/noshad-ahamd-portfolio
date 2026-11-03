# Performance and mobile stability

## Device tiers

`layout.tsx` sets `<html data-scene>` before first paint:

- `on`: desktop-class (>= 1024 px, mouse, 4+ cores, 4+ GB if reported, WebGL). Full WebGL scene, loaded when the browser is idle.
- `lite`: phones, tablets, weaker machines. NO WebGL and NO three.js download. A CSS laptop shows the projects.
- unset: reduced motion or data saver. Plain static design.

## What was removed from phones (and why)

| Item                                                          | Cost on a phone                                                     | Now                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| WebGL canvas (three.js + react-three-fiber + drei)            | large JS download, long tasks, GPU memory                           | not loaded                                                            |
| Revolving-light rings, one rotating layer per card (about 25) | each rotating layer is rasterised in full, about 2-3x the card size | static light, no animation                                            |
| `backdrop-filter` on about 40 elements                        | each one is an offscreen blur pass                                  | only the header blurs                                                 |
| Fixed full-screen film grain                                  | extra full-screen layer                                             | off                                                                   |
| Hero glows, idle floats                                       | permanent animations                                                | static                                                                |
| Project videos                                                | decoders and frame buffers stay alive after scrolling past          | mounted only near the viewport, unmounted after, no autoplay on touch |
| Lenis smooth scroll, parallax, custom cursor                  | a JS scroll loop and per-scroll updates                             | mouse users only                                                      |
| 3D tilt springs on every card                                 | a permanent 3D transform layer per card                             | CSS press tilt only while pressed                                     |

## Measuring (do this on your own machine; I cannot run Lighthouse from here)

1. Test the final URL directly: `https://www.noshadahmad.com/` (testing `noshadahmad.com` adds a redirect to www).
2. PageSpeed Insights (mobile) or Chrome DevTools -> Lighthouse -> Mobile -> Performance. Run 3 times and compare medians.
3. Real iPhone: Safari -> Develop (on a Mac) -> your iPhone -> Timelines / Layers / Memory while scrolling quickly up and down.
4. Bundle sizes: `pnpm build` prints First Load JS per route. Optional analysis: `pnpm dlx next experimental-analyze`.
5. Record the numbers (LCP, TBT, CLS, Speed Index, transferred KB) before and after in a table so claims stay honest.
