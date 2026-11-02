"use client";

/**
 * Purpose: the camera operator. Every frame it turns the page scroll position into a stage position, blends the
 * stages (timeline.ts), writes the result into the shared SceneParams, and flies the camera: orbit angle, elevation,
 * distance, and a view offset that places the scene origin where the layout has room (right of the headline on
 * desktop, above the copy on phones). It never touches scrolling; it only reads window.scrollY. Because the result is
 * a pure function of scroll (plus light damping), scrolling up reverses everything.
 * Runs before other useFrame callbacks (priority -1). Used by: scene.tsx.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  STAGES,
  at,
  easeOutCubic,
  sampleStages,
  screenFloat,
  slideState,
  stageT,
  writeParams,
  type SceneParams,
} from "@/lib/scene/timeline";

export const FOV = 32;
const LOOK_AT = new THREE.Vector3(0, 0.1, 0);

type Props = {
  params: SceneParams;
  pivots: React.RefObject<number[]>;
  projectCount: number;
  lastSlide: number;
  /** writes the canvas wrapper opacity (done by the parent, which owns the DOM node) */
  onOpacity: (value: number) => void;
};

export function Rig({ params, pivots, projectCount, lastSlide, onOpacity }: Props) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const smooth = useRef(0);
  const intro = useRef(0);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0, fine: false });

  useEffect(() => {
    pointer.current.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, dt) => {
    const w = size.width;
    const h = size.height;
    if (w === 0 || h === 0) return;
    const aspect = w / h;
    const portrait = aspect < 1;
    const piv = pivots.current;
    const sy = window.scrollY;
    const vh = window.innerHeight;

    const target = piv.length > 1 ? stageT(sy, piv) : 0;
    smooth.current += (target - smooth.current) * (1 - Math.exp(-dt * 6));
    intro.current = Math.min(1, intro.current + dt / 2.4);
    const introE = easeOutCubic(intro.current);

    const st = sampleStages(STAGES, smooth.current);
    const sf = piv.length > 4 ? screenFloat(sy, at(piv, 3), at(piv, 4), vh, projectCount) : 0;
    const slide = slideState(sf, lastSlide);

    writeParams(params, st, {
      intro: introE,
      screen: sf,
      from: slide.from,
      to: slide.to,
      mix: slide.mix,
    });

    // pointer parallax (mouse users only), eased
    const p = pointer.current;
    p.sx += ((p.fine ? p.x : 0) - p.sx) * (1 - Math.exp(-dt * 3));
    p.sy += ((p.fine ? p.y : 0) - p.sy) * (1 - Math.exp(-dt * 3));

    const kick = Math.sin(Math.PI * slide.mix); // a gentle camera sweep at every project change
    const az = st.az + kick * 0.16 + p.sx * 0.05;
    const el = st.el - p.sy * 0.025;

    const half = Math.tan((FOV * Math.PI) / 360);
    const fitDist = (st.extent * 2) / (2 * half * aspect * 0.9);
    const dist = Math.max(st.dist * (1 + (1 - introE) * 0.35), fitDist);

    camera.position.set(
      dist * Math.cos(el) * Math.sin(az),
      dist * Math.sin(el),
      dist * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(LOOK_AT);

    const ax = portrait ? st.axP : st.axD;
    const ay = portrait ? st.ayP : st.ayD;
    camera.setViewOffset(w, h, (0.5 - ax) * w, (0.5 - ay) * h, w, h);

    onOpacity(st.opacity * introE);
  }, -1);

  return null;
}
