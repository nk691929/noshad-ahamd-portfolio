"use client";

/**
 * Purpose: fade (and rise) its children into view once when scrolled to. Reduced motion: opacity only.
 * Inputs: variant preset name, optional delay (seconds). data-reveal lets the <noscript> rule show content without JS.
 * Used by: section headers and several sections.
 */
import { motion } from "motion/react";
import { pickVariants, useReduced, withDelay, type PresetName } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  variant?: PresetName;
  delay?: number;
  className?: string;
};

export function Reveal({ children, variant = "fadeUp", delay = 0, className }: Props) {
  const reduced = useReduced();
  const variants = withDelay(pickVariants(variant, reduced), delay);
  return (
    <motion.div
      data-reveal
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
