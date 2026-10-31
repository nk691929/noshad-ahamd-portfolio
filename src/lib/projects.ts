/**
 * Purpose: ranked project list and the tags actually in use. Used by: projects section, tests.
 */
import { projects } from "@content/projects";
import { PROJECT_TAGS, type Project, type ProjectTag } from "@/lib/content/schemas";

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => a.rank - b.rank);
}

export function getProjectTags(): ProjectTag[] {
  return PROJECT_TAGS.filter((tag) => projects.some((p) => p.tags.includes(tag)));
}
