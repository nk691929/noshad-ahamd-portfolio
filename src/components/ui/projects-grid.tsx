"use client";

/**
 * Purpose: bento project grid with tag filters. The first card is large, the second is wide. Cards reveal on scroll,
 * animate their position when filters change (layout animation, skipped under reduced motion) and tilt on hover.
 * Inputs: ranked projects, tags in use, labels, whether case-study routes exist (no content imports).
 * Used by: sections/projects.tsx.
 */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TiltCard } from "@/components/motion/tilt-card";
import { ProjectCard } from "@/components/ui/project-card";
import type { ProjectTag } from "@/lib/content/schemas";
import type { ProjectWithMedia } from "@/lib/projects";
import { duration, ease, pickVariants, useReduced } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  projects: ProjectWithMedia[];
  tags: ProjectTag[];
  allLabel: string;
  caseStudyLabel: string;
  caseStudiesReady: boolean;
  /** what this grid shows, for screen readers (for example "mobile apps") */
  label: string;
};

export function ProjectsGrid({
  projects,
  tags,
  allLabel,
  caseStudyLabel,
  caseStudiesReady,
  label,
}: Props) {
  const reduced = useReduced();
  const [tag, setTag] = useState<ProjectTag | "all">("all");
  const visible = useMemo(
    () => (tag === "all" ? projects : projects.filter((p) => p.tags.includes(tag))),
    [projects, tag],
  );
  const variants = pickVariants("fadeUp", reduced);
  const filters: Array<ProjectTag | "all"> = ["all", ...tags];

  return (
    <div>
      <div
        role="group"
        aria-label={`Filter ${label}`}
        className={cn("mb-8 flex flex-wrap gap-2", tags.length < 2 && "hidden")}
      >
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={tag === f}
            onClick={() => setTag(f)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              tag === f
                ? "border-border-strong bg-surface-hover text-fg"
                : "border-border text-fg-muted hover:text-fg",
            )}
          >
            {f === "all" ? allLabel : f}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {visible.length} {label} shown
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(230px,auto)] lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, i) => (
            <motion.li
              key={project.slug}
              data-reveal
              layout={!reduced}
              variants={variants}
              initial="hidden"
              whileInView="show"
              exit="exit"
              viewport={{ once: true, amount: 0.1 }}
              transition={{ layout: { duration: duration.slow, ease: ease.outExpo } }}
              className={cn(i === 0 && "sm:col-span-2 lg:row-span-2", i === 1 && "lg:col-span-2")}
            >
              <TiltCard className="h-full rounded-lg">
                <ProjectCard
                  project={project}
                  large={i === 0}
                  caseStudyLabel={caseStudyLabel}
                  {...(caseStudiesReady && project.caseStudy
                    ? { caseStudyHref: `/projects/${project.slug}` }
                    : {})}
                />
              </TiltCard>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
