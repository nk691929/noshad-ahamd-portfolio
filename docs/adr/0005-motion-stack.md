# ADR 0005: Motion for UI animation, Lenis for scrolling, no GSAP (yet)

- Status: accepted
- Context: the brief allows GSAP + ScrollTrigger "only where scroll choreography needs it" and demands a lean bundle, Lighthouse Performance >= 95, 60fps and reduced-motion support.
- Decision: all UI animation uses Motion (`motion/react`) with presets centralized in `src/lib/motion`. Scroll-linked effects (parallax) use Motion's `useScroll`. The hero load sequence and the tech marquee are pure CSS so they start at first paint and cost no JavaScript. Lenis smooth scrolling and the custom cursor are loaded lazily after mount/idle. GSAP is not installed because no effect requires pinned or scrubbed timelines.
- Consequences: smaller bundle. If a future section needs pinned/scrubbed choreography, add GSAP + ScrollTrigger for that section only (lazy-loaded) and supersede this ADR.
- Reduced motion: every preset has an opacity-only variant (unit-tested); cursor, tilt, magnetic, parallax and Lenis are off; CSS animations are disabled in a `prefers-reduced-motion` block.
