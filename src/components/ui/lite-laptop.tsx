"use client";

/**
 * Purpose: the lightweight stand-in for the WebGL laptop on phones and tablets: a laptop drawn with plain CSS whose
 * screen cross-fades between the real project screenshots (or a generated title card) as the visitor scrolls through
 * the showcase. One image at a time, opacity-only transitions, no WebGL, no three.js download.
 * Shown only when <html data-scene="lite"> (see scene.css). Inputs: slides + the active index. Decorative (aria-hidden).
 */
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { pickVariants, useReduced } from "@/lib/motion";
import { at } from "@/lib/scene/timeline";

export type LiteSlide = { slug: string; title: string; stack: string[]; cover?: string };

export function LiteLaptop({ slides, active }: { slides: LiteSlide[]; active: number }) {
  const reduced = useReduced();
  if (slides.length === 0) return null;
  const slide = at(slides, Math.min(active, slides.length - 1));

  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-sm">
      <div className="relative rounded-t-xl border border-border-strong bg-[#050607] p-[3%] shadow-glow">
        <div className="relative aspect-video overflow-hidden rounded-md bg-bg-elevated">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={slide.slug}
              className="absolute inset-0"
              variants={pickVariants("fadeIn", reduced)}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {slide.cover ? (
                <Image
                  src={slide.cover}
                  alt=""
                  fill
                  sizes="(max-width: 480px) 90vw, 384px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full flex-col justify-end gap-1 bg-gradient-to-br from-[#07080b] via-[#0b1d2c] to-[#0a3b36] p-4">
                  <span className="h-1 w-10 rounded bg-accent-3" />
                  <span className="font-display text-lg font-semibold leading-tight text-white">
                    {slide.title}
                  </span>
                  <span className="font-mono text-[10px] text-white/60">
                    {slide.stack.slice(0, 3).join(" · ")}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="relative -mx-[5%] h-3 rounded-b-xl bg-gradient-to-b from-[#c7ccd3] to-[#8d939c]">
        <span className="absolute left-1/2 top-0 h-1 w-1/5 -translate-x-1/2 rounded-b bg-black/25" />
      </div>
    </div>
  );
}
