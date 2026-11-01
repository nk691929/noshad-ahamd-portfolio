"use client";

/**
 * Purpose: container that reveals its <StaggerItem> descendants one after another when scrolled into view.
 * Items may sit inside plain elements (ul/li); variant propagation goes through React context.
 * Used by: about, skills, experience.
 */
import { motion } from "motion/react";
import { containerVariants, useReduced } from "@/lib/motion";

type Props = { children: React.ReactNode; className?: string; delayChildren?: number };

export function Stagger({ children, className, delayChildren = 0 }: Props) {
  const reduced = useReduced();
  return (
    <motion.div
      className={className}
      variants={containerVariants(reduced, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
