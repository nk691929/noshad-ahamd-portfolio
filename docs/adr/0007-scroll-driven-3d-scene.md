# ADR 0007: One fixed react-three-fiber scene, scroll-driven by a hand-written timeline

- Status: accepted
- Context: the portfolio should feel like one continuous cinematic 3D story (hero laptop, orbit to About, technology constellation, projects on the laptop screen, emerald finale) without hijacking scrolling, hurting mid-range phones, or breaking SEO/content.
- Decision:
  - Dependencies: `three`, `@react-three/fiber`, `@react-three/drei` (and `@types/three`). Nothing else. GSAP/ScrollTrigger is not added: scroll is only read (`window.scrollY`, already smoothed by the existing Lenis setup), and a ~60-line spline timeline (`lib/scene/timeline.ts`, unit-tested) is enough. This keeps ADR 0005 intact.
  - One fixed full-screen canvas behind the page (`pointer-events: none`, `z-index: -1`), never in the scroll flow. All real content stays in the DOM (SEO, accessibility, links).
  - The camera journey is a list of stages blended with Catmull-Rom splines. Stage positions come from measuring real section positions (`lib/scene/pivots.ts`), so copy changes cannot desync the scene. The scene origin is placed on screen with `camera.setViewOffset` so the 3D object sits beside the copy on desktop and above it on phones.
  - Everything is a pure function of scroll, so scrolling up reverses exactly. Light damping only smooths motion.
  - Gate: a tiny inline script sets `html[data-scene="on"]` before first paint only if WebGL works, reduced motion is off, data saver is off and the device is not very low-end. CSS keyed on that attribute reserves room for the 3D object; if the scene fails to load or loses its WebGL context the attribute becomes `off` and the original static design is shown.
  - Lazy: the three.js chunk loads on idle after first paint. Rendering pauses (`frameloop="never"`) while the canvas is faded out behind the dense project sections.
  - Assets: procedural geometry, a procedural environment (Lightformers), canvas-drawn labels and fallback screen cards. Real project screenshots (`public/media/<slug>.jpg`) replace the generated cards automatically.
- Consequences: a visible laptop screen shows real work once screenshots exist; the portrait moves to the About section while the scene is on; the pinned showcase section only exists in 3D mode (the regular Projects section always exists). Verify performance on a real mid-range phone; tuning knobs are listed in docs/SCENE.md.
