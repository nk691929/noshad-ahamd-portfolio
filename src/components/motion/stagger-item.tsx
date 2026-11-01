"use client";

/**
 * Purpose: one item inside <Stagger>. MUST be a descendant of Stagger (it inherits the hidden/show state;
 * on its own it would stay hidden). Used by: about, skills, experience.
 */
import { motion } from "motion/react";
import { pickVariants, useReduced, type PresetName } from "@/lib/motion";

type Props = { children: React.ReactNode; variant?: PresetName; className?: string };

export function StaggerItem({ children, variant = "fadeUp", className }: Props) {
  const reduced = useReduced();
  return (
    <motion.div data-reveal className={className} variants={pickVariants(variant, reduced)}>
      {children}
    </motion.div>
  );
}
