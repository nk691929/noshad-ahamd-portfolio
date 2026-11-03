/**
 * Purpose: server wrapper for the pinned 3D showcase. Picks the top-ranked projects (same list the 3D laptop screen
 * uses, see lib/scene-data.ts) and passes plain data, with the real GitHub / live / case-study links, to the client
 * stage. Hidden by CSS unless the 3D scene is on. Inputs: content/projects.ts, content/sections.ts.
 */
import { ShowcaseStage, type ShowcaseItem } from "@/components/ui/showcase-stage";
import { real } from "@/lib/content/real";
import { getShowcaseProjects } from "@/lib/scene-data";
import { CASE_STUDY_ROUTES_READY } from "@/lib/site";
import { sectionsCopy } from "@content/sections";

const STATUS = { live: "Live", "in-progress": "In progress", archived: "Archived" } as const;

export function ProjectShowcase() {
  const items: ShowcaseItem[] = getShowcaseProjects().map((p) => {
    const github = real(p.links.github);
    const live = real(p.links.live);
    const cover = real(p.cover);
    return {
      slug: p.slug,
      title: p.title,
      summary: real(p.summary) ?? "",
      stack: p.stack.slice(0, 5),
      tags: p.tags,
      ...(p.status ? { status: STATUS[p.status] } : {}),
      ...(github ? { github } : {}),
      ...(live ? { live } : {}),
      ...(cover ? { cover } : {}),
      ...(CASE_STUDY_ROUTES_READY && p.caseStudy ? { caseStudyHref: `/projects/${p.slug}` } : {}),
    };
  });
  return <ShowcaseStage items={items} copy={sectionsCopy.showcase} />;
}
