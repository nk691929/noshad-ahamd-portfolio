/**
 * Purpose: motion tokens for JS animations. Durations and easings MIRROR src/styles/tokens.css
 * (tests/motion.test.ts fails if they drift). Seconds, not milliseconds, because Motion uses seconds.
 * Used by: variants.ts and every motion component.
 */
type Bezier = [number, number, number, number];

export const duration = { fast: 0.15, base: 0.3, slow: 0.6, hero: 0.9 } as const;

export const ease: Record<"outExpo" | "inOut", Bezier> = {
  outExpo: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
};

/** Delay between siblings in a staggered group (CSS: --stagger: 80ms). */
export const stagger = 0.08;

export const spring = {
  magnetic: { stiffness: 150, damping: 15, mass: 0.2 },
  tilt: { stiffness: 200, damping: 20 },
  cursor: { stiffness: 500, damping: 40, mass: 0.4 },
  glow: { stiffness: 200, damping: 30 },
  pill: { type: "spring" as const, stiffness: 380, damping: 32 },
} as const;
