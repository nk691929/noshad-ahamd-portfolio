"use client";

/**
 * Purpose: hangs its child (the portrait) from a nail on two strings. Visitors can grab it with a finger or mouse and
 * swing it; on release it swings back like a pendulum (underdamped spring). Arrow keys also swing it. A gentle idle
 * sway keeps it alive. Only transform is animated. The page still scrolls: touch-action is pan-y, so vertical
 * swipes scroll and horizontal drags swing the card. Reduced motion: no idle sway and a stiff, non-oscillating spring.
 * Inputs: children, label (accessible name), hint (shown until first touch). Used by: hero, about.
 */
import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReduced } from "@/lib/motion";

const STRING = 120; // px between the nail and the top of the card
const MAX_DEG = 55;

type Props = { children: React.ReactNode; label: string; hint: string };

export function HangingCard({ children, label, hint }: Props) {
  const reduced = useReduced();
  const pivotRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [touched, setTouched] = useState(false);

  const target = useMotionValue(0); // degrees the visitor is holding the card at
  const sway = useMotionValue(0); // idle motion
  const swing = useSpring(
    target,
    reduced ? { stiffness: 260, damping: 40 } : { stiffness: 55, damping: 4.6, mass: 1 },
  );
  const angle = useTransform([swing, sway], (v) => {
    const [a = 0, b = 0] = v as number[];
    return a + b;
  });
  const cardLag = useTransform(angle, (a) => a * 0.16);

  useEffect(() => {
    if (reduced) return;
    const controls = animate(sway, [-1.3, 1.3], {
      duration: 3.4,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    });
    return () => controls.stop();
  }, [reduced, sway]);

  function angleFor(e: React.PointerEvent): number {
    const rect = pivotRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = Math.max(e.clientY - rect.top, 40);
    const deg = (-Math.atan2(dx, dy) * 180) / Math.PI;
    return Math.max(-MAX_DEG, Math.min(MAX_DEG, deg));
  }

  function nudge(deg: number) {
    setTouched(true);
    target.set(deg);
    window.setTimeout(() => target.set(0), 160);
  }

  return (
    <div
      ref={pivotRef}
      className="relative mx-auto w-full max-w-xs"
      role="group"
      aria-label={label}
    >
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-0 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-border-strong shadow-md"
      />
      <motion.div
        className="relative"
        style={{ rotate: angle, transformOrigin: "50% 0", paddingTop: STRING }}
      >
        <svg
          aria-hidden="true"
          className="absolute left-0 top-0 w-full overflow-visible text-fg-muted"
          height={STRING}
        >
          <line
            x1="50%"
            y1="6"
            x2="16%"
            y2={STRING}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="50%"
            y1="6"
            x2="84%"
            y2={STRING}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="16%" cy={STRING} r="3.5" fill="currentColor" />
          <circle cx="84%" cy={STRING} r="3.5" fill="currentColor" />
        </svg>
        <motion.div
          style={{ rotate: cardLag, transformOrigin: "50% 0", touchAction: "pan-y" }}
          className="cursor-grab select-none active:cursor-grabbing"
          tabIndex={0}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            setTouched(true);
            target.set(angleFor(e));
          }}
          onPointerMove={(e) => {
            if (dragging.current) target.set(angleFor(e));
          }}
          onPointerUp={() => {
            dragging.current = false;
            target.set(0);
          }}
          onPointerCancel={() => {
            dragging.current = false;
            target.set(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") nudge(-28);
            if (e.key === "ArrowRight") nudge(28);
          }}
        >
          {children}
        </motion.div>
      </motion.div>
      {!touched ? <p className="mt-4 text-center text-sm text-fg-muted">{hint}</p> : null}
    </div>
  );
}
