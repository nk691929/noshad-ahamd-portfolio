"use client";

/**
 * Purpose: bento project grid with tag filters. The first card is large, the second is wide.
 * Inputs: ranked projects, tags in use, labels, and whether case-study routes exist (no content imports).
 * Layout animation between filters is added in step 5. Used by: sections/projects.tsx.
 */
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/ui/project-card";
import type { Project, ProjectTag } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";

type Props = {
  projects: Project[];
  tags: ProjectTag[];
  allLabel: string;
  caseStudyLabel: string;
  caseStudiesReady: boolean;
};

export function ProjectsGrid({
  projects,
  tags,
  allLabel,
  caseStudyLabel,
  caseStudiesReady,
}: Props) {
  const [tag, setTag] = useState<ProjectTag | "all">("all");
  const visible = useMemo(
    () => (tag === "all" ? projects : projects.filter((p) => p.tags.includes(tag))),
    [projects, tag],
  );

  const filters: Array<ProjectTag | "all"> = ["all", ...tags];

  return (
    <div>
      <div role="group" aria-label="Filter projects" className="mb-8 flex flex-wrap gap-2">
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
        {visible.length} projects shown
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(230px,auto)] lg:grid-cols-4">
        {visible.map((project, i) => (
          <li
            key={project.slug}
            className={cn(i === 0 && "sm:col-span-2 lg:row-span-2", i === 1 && "lg:col-span-2")}
          >
            <ProjectCard
              project={project}
              large={i === 0}
              caseStudyLabel={caseStudyLabel}
              {...(caseStudiesReady && project.caseStudy
                ? { caseStudyHref: `/projects/${project.slug}` }
                : {})}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
