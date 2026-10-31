/**
 * Purpose: project ranks must be unique and getProjects() must return them ascending; tags in use are valid.
 */
import { describe, expect, it } from "vitest";
import { projects } from "@content/projects";
import { getProjectTags, getProjects } from "@/lib/projects";

describe("project ranking", () => {
  it("has unique ranks", () => {
    const ranks = projects.map((p) => p.rank);
    expect(new Set(ranks).size).toBe(ranks.length);
  });

  it("sorts ascending by rank", () => {
    const ranks = getProjects().map((p) => p.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("only lists tags that at least one project uses", () => {
    for (const tag of getProjectTags()) {
      expect(projects.some((p) => p.tags.includes(tag))).toBe(true);
    }
  });
});
