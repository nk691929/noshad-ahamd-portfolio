"use client";

/**
 * Purpose: custom cursor (dot + trailing ring) for mouse/trackpad users only; the native cursor stays visible.
 * The ring grows over interactive elements. Loaded lazily by MotionRoot. Not rendered under reduced motion.
 */
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { duration, spring, useFinePointer, useReduced } from "@/lib/motion";

const INTERACTIVE = "a, button, input, textarea, [data-cursor]";

export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReduced();
  const enabled = fine && !reduced;
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, spring.cursor);
  const ry = useSpring(y, spring.cursor);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      setHover(Boolean((e.target as Element | null)?.closest(INTERACTIVE)));
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[300] -ml-1 -mt-1 h-2 w-2 rounded-full bg-accent-2"
        style={{ x, y }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[300] -ml-5 -mt-5 h-10 w-10 rounded-full border border-accent-2"
        style={{ x: rx, y: ry }}
        animate={{ scale: hover ? 1.6 : 1 }}
        transition={{ duration: duration.fast }}
      />
    </>
  );
}
