"use client";

/**
 * Purpose: word-by-word heading reveal. Words slide up out of a clipping wrapper. Screen readers get the full
 * text once (sr-only); the animated words are aria-hidden. Reduced motion: words fade in together.
 * Inputs: text. Render it INSIDE a heading element. Used by: Section.
 */
import { motion } from "motion/react";
import { containerVariants, pickVariants, useReduced } from "@/lib/motion";

export function SplitText({ text }: { text: string }) {
  const reduced = useReduced();
  const words = text.split(" ");
  const wordVariants = pickVariants("word", reduced);

  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        variants={containerVariants(reduced)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
      >
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span className="-my-[0.1em] inline-block overflow-hidden py-[0.1em] align-bottom">
              <motion.span data-reveal className="inline-block" variants={wordVariants}>
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </motion.span>
    </>
  );
}
