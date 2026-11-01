/**
 * Purpose: one project card (tags, status, summary, stack, links). Placeholders (TODO(owner)) are hidden.
 * Inputs: a validated Project, whether it is the large first card, and whether case-study links are live.
 * Used by: projects-grid.tsx. Hover tilt/spotlight is added in step 5.
 */
import { Badge } from "@/components/ui/badge";
import { real } from "@/lib/content/real";
import type { Project } from "@/lib/content/schemas";
import { cn } from "@/lib/utils";

const STATUS: Record<NonNullable<Project["status"]>, string> = {
  live: "Live",
  "in-progress": "In progress",
  archived: "Archived",
};

type Props = {
  project: Project;
  large?: boolean;
  caseStudyHref?: string;
  caseStudyLabel: string;
};

const linkClass = "text-sm text-accent underline-offset-4 hover:underline";

export function ProjectCard({ project, large = false, caseStudyHref, caseStudyLabel }: Props) {
  const summary = real(project.summary);
  const github = real(project.links.github);
  const live = real(project.links.live);

  return (
    <article
      className={cn(
        "glass flex h-full flex-col gap-4 rounded-lg p-6 transition-colors duration-300 hover:bg-surface-hover motion-reduce:transition-none",
        large && "lg:justify-end lg:p-8",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {project.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
        {project.status ? <Badge className="text-accent">{STATUS[project.status]}</Badge> : null}
        {project.featured ? <Badge className="text-accent">Featured</Badge> : null}
      </div>
      <h3 className={cn("font-display", large ? "text-h3" : "text-lg font-semibold")}>
        {project.title}
      </h3>
      {summary ? <p className="text-fg-muted">{summary}</p> : null}
      {project.client ? <p className="text-sm text-fg-muted">Client: {project.client}</p> : null}
      <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
        {project.stack.map((s) => (
          <li key={s} className="font-mono text-xs text-fg-muted">
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2">
        {caseStudyHref ? (
          <a href={caseStudyHref} className={linkClass}>
            {caseStudyLabel} <span aria-hidden="true">→</span>
          </a>
        ) : null}
        {github ? (
          <a href={github} className={linkClass} target="_blank" rel="noopener noreferrer">
            GitHub<span className="sr-only"> (opens in a new tab)</span>{" "}
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {live ? (
          <a href={live} className={linkClass} target="_blank" rel="noopener noreferrer">
            Live site<span className="sr-only"> (opens in a new tab)</span>{" "}
            <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
