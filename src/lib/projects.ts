/**
 * Purpose: ranked project list with media discovered by filename (see lib/media.ts), the tags in use, and the two
 * display groups: "apps" (Flutter, React Native, Android) and "web" (everything else). Grouping is derived from tags,
 * so adding a project needs no extra field. Used by: projects section, tests.
 */
import { projects } from "@content/projects";
import { real } from "@/lib/content/real";
import { PROJECT_TAGS, type Project, type ProjectTag } from "@/lib/content/schemas";
import { projectMedia } from "@/lib/media";

export type ProjectWithMedia = Project & { video?: string };
export type ProjectGroupId = "apps" | "web";

const APP_TAGS: ProjectTag[] = ["Flutter", "Android", "Mobile"];
const WEB_TAGS: ProjectTag[] = ["Web", "AI"];

export function getProjects(): ProjectWithMedia[] {
  return [...projects]
    .sort((a, b) => a.rank - b.rank)
    .map((p) => {
      const media = projectMedia(p.slug);
      return {
        ...p,
        cover: real(p.cover) ?? media.cover ?? p.cover,
        ...(media.video ? { video: media.video } : {}),
      };
    });
}

export function getProjectTags(): ProjectTag[] {
  return PROJECT_TAGS.filter((tag) => projects.some((p) => p.tags.includes(tag)));
}

/** A project is an app when it carries a Flutter, Android or Mobile tag; otherwise it is a website. */
export function groupOf(project: Pick<Project, "tags">): ProjectGroupId {
  return project.tags.some((t) => APP_TAGS.includes(t)) ? "apps" : "web";
}

export function getProjectGroups(): {
  id: ProjectGroupId;
  projects: ProjectWithMedia[];
  tags: ProjectTag[];
}[] {
  const all = getProjects();
  return (["apps", "web"] as const)
    .map((id) => {
      const list = all.filter((p) => groupOf(p) === id);
      const tagPool = id === "apps" ? APP_TAGS : WEB_TAGS;
      const tags = tagPool.filter((tag) => list.some((p) => p.tags.includes(tag)));
      return { id, projects: list, tags };
    })
    .filter((g) => g.projects.length > 0);
}
