/**
 * Purpose: guard the pure maths of the scroll-driven scene: spline sampling, scroll -> stage mapping, which screen is
 * shown, and the slide transition timing. (The WebGL rendering itself is checked in the browser; see docs/SCENE.md.)
 */
import { describe, expect, it } from "vitest";
import {
  STAGES,
  STAGE_COUNT,
  catmull,
  sampleStages,
  screenFloat,
  slideState,
  stageT,
  createParams,
  writeParams,
} from "@/lib/scene/timeline";

describe("catmull", () => {
  it("passes through its control points", () => {
    expect(catmull(0, 1, 2, 3, 0)).toBeCloseTo(1);
    expect(catmull(0, 1, 2, 3, 1)).toBeCloseTo(2);
  });
});

describe("sampleStages", () => {
  it("hits every stage exactly at integer positions", () => {
    for (let i = 0; i < STAGE_COUNT; i++) {
      const s = sampleStages(STAGES, i);
      const stage = STAGES[i];
      expect(s.az).toBeCloseTo(stage?.az ?? NaN);
      expect(s.dist).toBeCloseTo(stage?.dist ?? NaN);
    }
  });

  it("keeps unit values inside 0..1 and scale non-negative along the whole journey", () => {
    for (let t = 0; t <= STAGE_COUNT - 1; t += 0.02) {
      const s = sampleStages(STAGES, t);
      for (const v of [s.open, s.tech, s.finale, s.opacity]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
      expect(s.scale).toBeGreaterThanOrEqual(0);
    }
  });

  it("is hidden behind the dense sections and focused at the end", () => {
    expect(sampleStages(STAGES, 5).opacity).toBe(0);
    expect(sampleStages(STAGES, 7).finale).toBe(1);
    expect(sampleStages(STAGES, 2).tech).toBe(1);
  });
});

describe("stageT", () => {
  const pivots = [0, 800, 1800, 3000, 6000, 6700, 9000, 11000];

  it("clamps at both ends and interpolates between pivots", () => {
    expect(stageT(-10, pivots)).toBe(0);
    expect(stageT(1300, pivots)).toBeCloseTo(1.5);
    expect(stageT(99999, pivots)).toBe(7);
  });

  it("never goes backwards as scroll increases (so scrolling up reverses exactly)", () => {
    let previous = -1;
    for (let y = 0; y <= 11000; y += 25) {
      const t = stageT(y, pivots);
      expect(t).toBeGreaterThanOrEqual(previous);
      previous = t;
    }
  });
});

describe("screen and slides", () => {
  it("starts on the portfolio slide and ends on the last project", () => {
    expect(screenFloat(0, 3000, 6000, 900, 6)).toBe(0);
    expect(screenFloat(3000, 3000, 6000, 900, 6)).toBeCloseTo(1);
    expect(screenFloat(6000, 3000, 6000, 900, 6)).toBeCloseTo(6);
    expect(screenFloat(9000, 3000, 6000, 900, 6)).toBe(6);
  });

  it("holds a slide, then transitions near the end of each step", () => {
    expect(slideState(1.0, 6)).toMatchObject({ from: 1, to: 2, mix: 0, active: 1 });
    const mid = slideState(1.8, 6);
    expect(mid.mix).toBeGreaterThan(0);
    expect(mid.mix).toBeLessThan(1);
    expect(slideState(1.99, 6).active).toBe(2);
    expect(slideState(6, 6)).toMatchObject({ from: 6, to: 6, mix: 0, active: 6 });
  });
});

describe("writeParams", () => {
  it("copies stage values and extras into the shared object", () => {
    const params = createParams();
    writeParams(params, sampleStages(STAGES, 2), { mix: 0.5, intro: 1 });
    expect(params.tech).toBe(1);
    expect(params.mix).toBe(0.5);
    expect(params.intro).toBe(1);
  });
});
