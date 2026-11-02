/**
 * Purpose: build the data the 3D scene and the project showcase share, on the server, from /content and public/media.
 * The first SHOWCASE_COUNT ranked projects are featured. A project with a screenshot (public/media/<slug>.jpg) shows
 * it on the laptop screen; otherwise a generated title card is drawn. Used by: app/page.tsx, project-showcase.tsx.
 */
import { real } from "@/lib/content/real";
import type { SceneData, Slide, TechNode } from "@/lib/scene/types";
import { getProjects } from "@/lib/projects";
import { profile } from "@content/profile";
import { skills } from "@content/skills";

export const SHOWCASE_COUNT = 6;
const MAX_TECH = 12;

export function getShowcaseProjects() {
  return getProjects().slice(0, SHOWCASE_COUNT);
}

/** Round-robin across groups so a shorter list (phones) still shows a mix of technologies. */
function pickTech(): TechNode[] {
  const groups = ["Mobile", "Backend", "Web", "Tools"] as const;
  const lists = groups.map((g) =>
    skills
      .filter((s) => s.group === g && s.tier !== "familiar")
      .map((s) => ({ name: s.name, group: s.group })),
  );
  const out: TechNode[] = [];
  for (let i = 0; out.length < MAX_TECH && lists.some((l) => i < l.length); i++) {
    for (const list of lists) {
      const item = list[i];
      if (item && out.length < MAX_TECH) out.push(item);
    }
  }
  return out;
}

export function getSceneData(): SceneData {
  const hero: Slide = { title: profile.name, subtitle: "Flutter Developer" };
  const slides: Slide[] = [
    hero,
    ...getShowcaseProjects().map((p) => {
      const cover = real(p.cover);
      return {
        title: p.title,
        subtitle: p.stack.slice(0, 3).join("  ·  "),
        ...(cover ? { cover } : {}),
      };
    }),
  ];
  return { slides, tech: pickTech() };
}
