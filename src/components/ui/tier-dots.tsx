"use client";

/**
 * Purpose: three-dot skill tier indicator (core=3, proficient=2, familiar=1); dots pop in one by one when scrolled
 * into view. Never shows percentages. Inputs: tier + visible label (accessible name). Used by: skills section.
 */
import { motion } from "motion/react";
import { containerVariants, pickVariants, useReduced, withDelay } from "@/lib/motion";
import { cn } from "@/lib/utils";

const LEVEL = { core: 3, proficient: 2, familiar: 1 } as const;

export function TierDots({ tier, label }: { tier: keyof typeof LEVEL; label: string }) {
  const reduced = useReduced();
  const dot = pickVariants("dotPop", reduced);

  return (
    <motion.span
      role="img"
      aria-label={label}
      className="inline-flex gap-1"
      variants={containerVariants(reduced, 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.8 }}
    >
      {[1, 2, 3].map((n) => (
        <motion.span
          key={n}
          data-reveal
          variants={
            n <= LEVEL[tier] ? withDelay(dot, 0) : { hidden: { opacity: 1 }, show: { opacity: 1 } }
          }
          className={cn(
            "h-2 w-2 rounded-full",
            n <= LEVEL[tier] ? "bg-accent-2" : "bg-border-strong",
          )}
        />
      ))}
    </motion.span>
  );
}
