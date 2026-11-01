"use client";

/**
 * Purpose: subtle scroll parallax (transform only) for decorative layers. Disabled under reduced motion.
 * Inputs: distance = px the layer travels over the first 900px of scroll. Used by: hero background blobs.
 */
import { motion, useScroll, useTransform } from "motion/react";
import { useReduced } from "@/lib/motion";

export function Parallax({
  children,
  distance = 100,
}: {
  children: React.ReactNode;
  distance?: number;
}) {
  const reduced = useReduced();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], [0, distance]);

  if (reduced) return <div className="absolute inset-0">{children}</div>;
  return (
    <motion.div className="absolute inset-0" style={{ y }}>
      {children}
    </motion.div>
  );
}
