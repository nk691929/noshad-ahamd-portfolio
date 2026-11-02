"use client";

/**
 * Purpose: a 3D card. Mouse: hover tilt plus a cursor-following spotlight. Touch: pressing tilts the card toward the
 * finger and it springs back on release (scrolling is never blocked). Always carries the revolving-light ring.
 * Transform/opacity only. Reduced motion: no tilt, ring is static (CSS).
 * Inputs: maxTilt degrees. Used by: projects grid, skills, portrait.
 */
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { spring, useReduced } from "@/lib/motion";
import "@/styles/ring.css";

type Props = { children: React.ReactNode; className?: string; maxTilt?: number; ring?: boolean };

const GLOW = 300; // spotlight diameter in px (keep in sync with .spotlight in sections.css)

export function TiltCard({ children, className, maxTilt = 6, ring = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const pressed = useRef(false);
  const reduced = useReduced();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [maxTilt, -maxTilt]), spring.tilt);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-maxTilt, maxTilt]), spring.tilt);
  const gx = useMotionValue(-GLOW);
  const gy = useMotionValue(-GLOW);
  const glow = useSpring(0, spring.glow);

  function track(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
    gx.set(e.clientX - r.left - GLOW / 2);
    gy.set(e.clientY - r.top - GLOW / 2);
  }

  function release() {
    pressed.current = false;
    px.set(0);
    py.set(0);
    glow.set(0);
  }

  if (reduced) {
    return (
      <div className={cn("relative", className)}>
        {children}
        {ring ? <span className="ring" aria-hidden="true" /> : null}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse" || pressed.current) track(e);
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") {
          pressed.current = true;
          track(e);
          glow.set(1);
        }
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") glow.set(1);
      }}
      onPointerLeave={release}
      onPointerUp={release}
      onPointerCancel={release}
    >
      {children}
      {ring ? <span className="ring" aria-hidden="true" /> : null}
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
