/**
 * Purpose: guard the motion system. (1) Every preset has a reduced variant with the same states and NO movement
 * (opacity only). (2) JS motion tokens match the CSS tokens. (3) Reduced stagger is zero.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { duration, stagger } from "@/lib/motion/tokens";
import { containerVariants, presets, withDelay } from "@/lib/motion/variants";

const MOVEMENT_KEYS = [
  "x",
  "y",
  "z",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "skew",
  "skewX",
  "skewY",
];

describe("reduced variants", () => {
  for (const [name, pair] of Object.entries(presets)) {
    it(`${name}: same states, opacity only`, () => {
      expect(Object.keys(pair.reduced).sort()).toEqual(
        expect.arrayContaining(
          Object.keys(pair.full)
            .filter((k) => k !== "exit")
            .sort(),
        ),
      );
      for (const state of Object.values(pair.reduced)) {
        const keys = Object.keys(state as object);
        for (const bad of MOVEMENT_KEYS)
          expect(keys, `${name} reduced uses ${bad}`).not.toContain(bad);
      }
    });
  }

  it("container variants do not stagger under reduced motion", () => {
    const show = containerVariants(true).show as { transition: { staggerChildren: number } };
    expect(show.transition.staggerChildren).toBe(0);
    const full = containerVariants(false).show as { transition: { staggerChildren: number } };
    expect(full.transition.staggerChildren).toBe(stagger);
  });

  it("withDelay adds a delay to the show state", () => {
    const v = withDelay(presets.fadeUp.full, 0.3).show as { transition: { delay: number } };
    expect(v.transition.delay).toBe(0.3);
  });
});

describe("motion tokens mirror tokens.css", () => {
  const css = readFileSync(path.resolve(process.cwd(), "src/styles/tokens.css"), "utf8");
  const ms = (name: string) => {
    const m = new RegExp(`--${name}:\\s*(\\d+)ms`).exec(css);
    if (!m?.[1]) throw new Error(`--${name} not found`);
    return Number(m[1]) / 1000;
  };

  it("durations and stagger match", () => {
    expect(duration.fast).toBe(ms("dur-fast"));
    expect(duration.base).toBe(ms("dur-base"));
    expect(duration.slow).toBe(ms("dur-slow"));
    expect(duration.hero).toBe(ms("dur-hero"));
    expect(stagger).toBe(ms("stagger"));
  });
});
