"use client";

/**
 * Purpose: hover tilt (transform) plus a cursor-following spotlight (a translated circle with animated opacity,
 * so nothing repaints). Only for mouse/trackpad users without reduced motion; otherwise renders children as-is.
 * Inputs: maxTilt degrees. Used by: projects grid.
 */
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { spring, useFinePointer, useReduced } from "@/lib/motion";

type Props = { children: React.ReactNode; className?: string; maxTilt?: number };

const GLOW = 300; // spotlight diameter in px (keep in sync with .spotlight in sections.css)

export function TiltCard({ children, className, maxTilt = 6 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReduced();
  const enabled = fine && !reduced;
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [maxTilt, -maxTilt]), spring.tilt);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-maxTilt, maxTilt]), spring.tilt);
  const gx = useMotionValue(-GLOW);
  const gy = useMotionValue(-GLOW);
  const glow = useSpring(0, spring.glow);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
    gx.set(e.clientX - r.left - GLOW / 2);
    gy.set(e.clientY - r.top - GLOW / 2);
  }

  function onLeave() {
    px.set(0);
    py.set(0);
    glow.set(0);
  }

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onPointerMove={onMove}
      onPointerEnter={() => glow.set(1)}
      onPointerLeave={onLeave}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
      >
        <motion.span
          className="spotlight absolute left-0 top-0 rounded-full"
          style={{ x: gx, y: gy, opacity: glow }}
        />
      </span>
    </motion.div>
  );
}
