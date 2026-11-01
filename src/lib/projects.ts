/**
 * Purpose: ranked project list with media discovered by filename (see lib/media.ts), and the tags in use.
 * A `cover` set in content wins; otherwise public/media/<slug>.(jpg|webp|png) is used when it exists.
 * Used by: projects section, tests.
 */
import { projects } from "@content/projects";
import { real } from "@/lib/content/real";
import { PROJECT_TAGS, type Project, type ProjectTag } from "@/lib/content/schemas";
import { projectMedia } from "@/lib/media";

export type ProjectWithMedia = Project & { video?: string };

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
