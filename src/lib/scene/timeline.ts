/**
 * Purpose: the pure maths behind the scroll-driven 3D scene (no DOM, no three.js), so it can be unit-tested.
 * One continuous timeline: a list of STAGES (camera, anchor, object state). Scroll position maps to a float stage
 * position `t`; sampleStages() blends the stages with a Catmull-Rom spline so the camera never stops dead at a
 * keyframe. Everything is a pure function of scroll, so scrolling up reverses the animation exactly.
 * HOW TO TUNE: edit STAGES below (one object per stage; see docs/SCENE.md). Stage order must match
 * lib/scene/pivots.ts: hero, about, skills, showcase start, showcase end, recede, pre-contact, contact.
 * Used by: components/scene/*, tests/scene-timeline.test.ts.
 */

export const STAGE_KEYS = [
  "axD", // screen anchor of the scene origin, desktop (0..1 from left)
  "ayD", //   ... desktop (0..1 from top)
  "axP", //   ... portrait / phone
  "ayP",
  "az", // camera azimuth (radians)
  "el", // camera elevation (radians)
  "dist", // camera distance
  "extent", // half-width (world units) that must stay inside the screen
  "yaw", // laptop yaw
  "scale", // laptop scale
  "open", // lid open amount 0..1
  "tech", // technology constellation opacity 0..1
  "finale", // convergence into the emerald focal point 0..1
  "opacity", // whole canvas opacity 0..1 (dimmed behind dense text, 0 when hidden)
] as const;

export type StageKey = (typeof STAGE_KEYS)[number];
export type Stage = Record<StageKey, number>;

/** Index helper that fails loudly instead of returning undefined (noUncheckedIndexedAccess). */
export function at<T>(list: readonly T[], index: number): T {
  const value = list[index];
  if (value === undefined) throw new Error(`index ${index} out of range (length ${list.length})`);
  return value;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
export const smootherstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

/** Scalar Catmull-Rom: passes through p1 at t=0 and p2 at t=1. */
export function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

const UNIT_KEYS: StageKey[] = ["open", "tech", "finale", "opacity"];

export function sampleStages(stages: readonly Stage[], t: number): Stage {
  const last = stages.length - 1;
  const x = clamp(t, 0, last);
  const i = Math.min(Math.floor(x), last - 1);
  const f = x - i;
  const out = {} as Stage;
  for (const key of STAGE_KEYS) {
    const p0 = at(stages, Math.max(i - 1, 0))[key];
    const p1 = at(stages, i)[key];
    const p2 = at(stages, i + 1)[key];
    const p3 = at(stages, Math.min(i + 2, last))[key];
    let v = catmull(p0, p1, p2, p3, f);
    if (UNIT_KEYS.includes(key)) v = clamp(v, 0, 1);
    if (key === "scale") v = Math.max(0, v);
    out[key] = v;
  }
  return out;
}

/** Scroll position -> float stage position, given the scroll position (pivot) where each stage is "reached". */
export function stageT(scrollY: number, pivots: readonly number[]): number {
  if (pivots.length < 2 || scrollY <= at(pivots, 0)) return 0;
  for (let i = 0; i < pivots.length - 1; i++) {
    const a = at(pivots, i);
    const b = at(pivots, i + 1);
    if (scrollY < b) return i + (scrollY - a) / (b - a);
  }
  return pivots.length - 1;
}

/**
 * Which slide the laptop screen shows, as a float. Slide 0 is the portfolio itself, slides 1..projectCount are the
 * showcase projects. The first switch (0 -> 1) happens just before the showcase pins; then the float advances one
 * unit per project while the showcase is pinned (p3..p4).
 */
export function screenFloat(
  scrollY: number,
  p3: number,
  p4: number,
  vh: number,
  projectCount: number,
): number {
  const lead = vh * 0.6;
  if (scrollY <= p3 - lead) return 0;
  if (scrollY < p3) return (scrollY - (p3 - lead)) / lead;
  if (scrollY < p4) return 1 + ((scrollY - p3) / (p4 - p3)) * (projectCount - 1);
  return projectCount;
}

export type SlideState = { from: number; to: number; mix: number; active: number };

/** Each step holds the current slide, then transitions during the last ~40% of the step. */
export function slideState(s: number, lastIndex: number): SlideState {
  const idx = Math.floor(s);
  const f = s - idx;
  const from = Math.min(idx, lastIndex);
  const to = Math.min(idx + 1, lastIndex);
  const mix = from === to ? 0 : smootherstep(0.62, 1, f);
  return { from, to, mix, active: mix >= 0.5 ? to : from };
}

export type SceneParams = Stage & {
  intro: number;
  screen: number;
  from: number;
  to: number;
  mix: number;
};

export function createParams(): SceneParams {
  const s = {} as Stage;
  for (const key of STAGE_KEYS) s[key] = 0;
  return { ...s, intro: 0, screen: 0, from: 0, to: 0, mix: 0 };
}

/** Copies stage values and extras into the shared params object (one place that writes to it). */
export function writeParams(target: SceneParams, ...patches: Partial<SceneParams>[]): void {
  for (const patch of patches) Object.assign(target, patch);
}

const stage = (v: Stage): Stage => v;

/** The camera journey. Anchors: where the scene origin sits on screen (desktop = right of the copy, phone = top). */
export const STAGES: readonly Stage[] = [
  // 0 hero: laptop opens on the right, slightly turned toward the headline
  stage({
    axD: 0.7,
    ayD: 0.52,
    axP: 0.5,
    ayP: 0.31,
    az: -0.55,
    el: 0.16,
    dist: 7.4,
    extent: 2.0,
    yaw: -0.25,
    scale: 1,
    open: 1,
    tech: 0,
    finale: 0,
    opacity: 1,
  }),
  // 1 about: camera swings round and above; scene dims behind the text
  stage({
    axD: 0.8,
    ayD: 0.5,
    axP: 0.5,
    ayP: 0.27,
    az: 0.85,
    el: 0.5,
    dist: 8.2,
    extent: 2.0,
    yaw: 0.4,
    scale: 0.85,
    open: 1,
    tech: 0,
    finale: 0,
    opacity: 0.5,
  }),
  // 2 skills: pull back and look down; the laptop becomes the core of the technology constellation
  stage({
    axD: 0.72,
    ayD: 0.52,
    axP: 0.5,
    ayP: 0.31,
    az: 1.7,
    el: 0.85,
    dist: 11,
    extent: 4.9,
    yaw: 0.8,
    scale: 0.5,
    open: 0.55,
    tech: 1,
    finale: 0,
    opacity: 0.95,
  }),
  // 3 showcase start: constellation collapses back into the device, which swings forward
  stage({
    axD: 0.7,
    ayD: 0.5,
    axP: 0.5,
    ayP: 0.31,
    az: -0.3,
    el: 0.12,
    dist: 6.6,
    extent: 2.2,
    yaw: -0.15,
    scale: 1.1,
    open: 1,
    tech: 0,
    finale: 0,
    opacity: 1,
  }),
  // 4 showcase end: closest camera, the visitor is right at the screen
  stage({
    axD: 0.68,
    ayD: 0.52,
    axP: 0.5,
    ayP: 0.31,
    az: 0.25,
    el: 0.08,
    dist: 5.4,
    extent: 2.0,
    yaw: 0.1,
    scale: 1.1,
    open: 1,
    tech: 0,
    finale: 0,
    opacity: 1,
  }),
  // 5 recede: scene fades out behind the dense project grids
  stage({
    axD: 0.7,
    ayD: 0.5,
    axP: 0.5,
    ayP: 0.31,
    az: 0.6,
    el: 0.2,
    dist: 8,
    extent: 2.2,
    yaw: 0.3,
    scale: 0.9,
    open: 1,
    tech: 0,
    finale: 0,
    opacity: 0,
  }),
  // 6 pre-contact: still hidden, camera drifts into place
  stage({
    axD: 0.5,
    ayD: 0.4,
    axP: 0.5,
    ayP: 0.26,
    az: 0.3,
    el: 0.12,
    dist: 9,
    extent: 2.0,
    yaw: 0.1,
    scale: 0.6,
    open: 0.6,
    tech: 0,
    finale: 0,
    opacity: 0,
  }),
  // 7 contact: the laptop dissolves into one emerald focal point
  stage({
    axD: 0.5,
    ayD: 0.34,
    axP: 0.5,
    ayP: 0.25,
    az: 0,
    el: 0.1,
    dist: 9,
    extent: 2.0,
    yaw: 0,
    scale: 0.08,
    open: 0.2,
    tech: 0,
    finale: 1,
    opacity: 0.85,
  }),
];

export const STAGE_COUNT = STAGES.length;
