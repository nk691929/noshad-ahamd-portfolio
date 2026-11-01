"use client";

/**
 * Purpose: pulls its child slightly toward the pointer (spring, transform only). Active only for mouse/trackpad
 * users without reduced motion; otherwise renders the child untouched.
 * Inputs: strength (0-1). Used by: hero CTAs.
 */
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { spring, useFinePointer, useReduced } from "@/lib/motion";

type Props = { children: React.ReactNode; strength?: number; className?: string };

export function Magnetic({ children, strength = 0.3, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReduced();
  const enabled = fine && !reduced;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring.magnetic);
  const sy = useSpring(y, spring.magnetic);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  if (!enabled) return <span className={`inline-block ${className ?? ""}`}>{children}</span>;

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.span>
  );
}
