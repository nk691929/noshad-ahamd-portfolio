"use client";

/**
 * Purpose: the pinned "featured work" section. The section is tall; its inner layer is sticky, so the visitor scrolls
 * through the projects while the fixed 3D laptop (right) changes screens and this card (left) shows the matching
 * project, with the real links. Which project is active uses the SAME maths as the 3D scene (slideState), so text and
 * screen change together. Numbered buttons jump to a project (keyboard friendly). Reads scroll only; never moves it.
 * Inputs: plain items + copy (no content imports). Used by: sections/project-showcase.tsx.
 */
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { pickVariants, useReduced } from "@/lib/motion";
import { at, slideState } from "@/lib/scene/timeline";
import { cn } from "@/lib/utils";

export type ShowcaseItem = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  tags: string[];
  status?: string;
  github?: string;
  live?: string;
  caseStudyHref?: string;
};

type Copy = {
  eyebrow: string;
  title: string;
  hint: string;
  jump: string;
  live: string;
  github: string;
  caseStudy: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const linkClass = "text-sm text-accent underline-offset-4 hover:underline";

/** Scroll distance (in svh) given to each project while pinned. Keep in sync with docs/SCENE.md. */
const STEP_SVH = 85;

export function ShowcaseStage({ items, copy }: { items: ShowcaseItem[]; copy: Copy }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReduced();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = 1 + Math.min(1, Math.max(0, v)) * (items.length - 1);
    const next = Math.max(0, slideState(s, items.length).active - 1);
    setActive((prev) => (prev === next ? prev : next));
  });

  if (items.length === 0) return null;
  const item = at(items, Math.min(active, items.length - 1));

  function jump(index: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    const fraction = items.length > 1 ? index / (items.length - 1) : 0;
    window.scrollTo({ top: top + fraction * range + 2 });
  }

  return (
    <section
      ref={ref}
      id="showcase"
      aria-labelledby="showcase-title"
      style={{ height: `${items.length * STEP_SVH + 100}svh` }}
      className="relative"
    >
      <div className="sticky top-0 flex h-svh items-end pb-8 lg:items-center lg:pb-0">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="max-w-md">
            <p className="font-mono text-sm uppercase tracking-widest text-accent">
              {copy.eyebrow} · {pad(active + 1)} / {pad(items.length)}
            </p>
            <h2 id="showcase-title" className="sr-only">
              {copy.title}
            </h2>
            <div className="glass mt-4 rounded-lg p-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={item.slug}
                  variants={pickVariants("fadeUp", reduced)}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {item.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                    {item.status ? <Badge className="text-accent">{item.status}</Badge> : null}
                  </div>
                  <h3 className="font-display text-h3">{item.title}</h3>
                  {item.summary ? <p className="text-fg-muted">{item.summary}</p> : null}
                  <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
                    {item.stack.map((s) => (
                      <li key={s} className="font-mono text-xs text-fg-muted">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                    {item.caseStudyHref ? (
                      <a href={item.caseStudyHref} className={linkClass}>
                        {copy.caseStudy} <span aria-hidden="true">→</span>
                      </a>
                    ) : null}
                    {item.live ? (
                      <a
                        href={item.live}
                        className={linkClass}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {copy.live}
                        <span className="sr-only"> (opens in a new tab)</span>{" "}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                    {item.github ? (
                      <a
                        href={item.github}
                        className={linkClass}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {copy.github}
                        <span className="sr-only"> (opens in a new tab)</span>{" "}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <ol className="mt-5 flex flex-wrap gap-2" aria-label={copy.jump}>
              {items.map((it, i) => (
                <li key={it.slug}>
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    aria-current={i === active ? "true" : undefined}
                    aria-label={`${it.title}`}
                    className={cn(
                      "h-9 min-w-9 rounded-full border px-3 font-mono text-xs transition-colors",
                      i === active
                        ? "border-transparent bg-fg text-bg"
                        : "border-border text-fg-muted hover:text-fg",
                    )}
                  >
                    {pad(i + 1)}
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-4 hidden text-sm text-fg-muted sm:block">{copy.hint}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
