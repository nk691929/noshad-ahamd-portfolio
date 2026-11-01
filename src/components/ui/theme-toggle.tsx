"use client";

/**
 * Purpose: accessible dark/light toggle. The icon swaps with a rotate+fade (opacity only under reduced motion).
 * Inputs: none (reads theme from next-themes). Used by: nav and anywhere a toggle is needed.
 */
import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { duration, ease, useReduced } from "@/lib/motion";

const subscribe = () => () => {};

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reduced = useReduced();
  // false on the server and during hydration, true afterwards (avoids a hydration mismatch)
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="glass inline-flex h-10 w-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-hover"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          className="inline-flex"
          initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: duration.base, ease: ease.outExpo }}
        >
          {isDark ? (
            <svg {...iconProps}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg {...iconProps}>
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
