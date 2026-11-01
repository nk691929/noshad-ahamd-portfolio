/**
 * Purpose: the ONLY place animation variants are defined. Every preset has a `full` and a `reduced` variant;
 * reduced variants use opacity only (no movement). tests/motion.test.ts enforces this.
 * HOW TO ADD: add a preset below with both variants, then use pickVariants("name", reduced) in a component.
 * Used by: components in src/components/motion and a few ui components.
 */
import type { TargetAndTransition, Variants } from "motion/react";
import { duration, ease, stagger } from "./tokens";

type Pair = { full: Variants; reduced: Variants };

const fadeOnly = (d: number = duration.fast): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: d } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
});

export const presets = {
  fadeUp: {
    full: {
      hidden: { opacity: 0, y: 24 },
      show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.outExpo } },
      exit: { opacity: 0, y: 12, transition: { duration: duration.fast } },
    },
    reduced: fadeOnly(),
  },
  fadeIn: {
    full: {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: duration.slow, ease: ease.outExpo } },
      exit: { opacity: 0, transition: { duration: duration.fast } },
    },
    reduced: fadeOnly(),
  },
  /** One word of a split heading; the wrapper clips it, so it slides up from below. */
  word: {
    full: {
      hidden: { y: "110%" },
      show: { y: "0%", transition: { duration: duration.slow, ease: ease.outExpo } },
    },
    reduced: fadeOnly(),
  },
  /** Skill tier dot. */
  dotPop: {
    full: {
      hidden: { opacity: 0, scale: 0.4 },
      show: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: ease.outExpo } },
    },
    reduced: fadeOnly(),
  },
} satisfies Record<string, Pair>;

export type PresetName = keyof typeof presets;

export function pickVariants(name: PresetName, reduced: boolean): Variants {
  return presets[name][reduced ? "reduced" : "full"];
}

/** Parent that staggers its motion children. Reduced motion shows children together. */
export function containerVariants(reduced: boolean, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : stagger, delayChildren } },
  };
}

/** Same variants with an extra delay on the "show" state. */
export function withDelay(variants: Variants, delay: number): Variants {
  const show = variants.show;
  if (!show || typeof show === "function") return variants;
  const target = show as TargetAndTransition;
  return { ...variants, show: { ...target, transition: { ...target.transition, delay } } };
}
