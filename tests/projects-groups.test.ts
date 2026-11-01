/**
 * Purpose: every project lands in exactly one group; Flutter/Android/Mobile projects are "apps", the rest are "web".
 */
import { describe, expect, it } from "vitest";
import { projects } from "@content/projects";
import { getProjectGroups, groupOf } from "@/lib/projects";

describe("project groups", () => {
  it("puts every project in exactly one group", () => {
    const grouped = getProjectGroups().flatMap((g) => g.projects.map((p) => p.slug));
    expect(grouped.sort()).toEqual(projects.map((p) => p.slug).sort());
  });

  it("classifies by tags", () => {
    expect(groupOf({ tags: ["Flutter"] })).toBe("apps");
    expect(groupOf({ tags: ["Flutter", "Web"] })).toBe("apps");
    expect(groupOf({ tags: ["Mobile"] })).toBe("apps");
    expect(groupOf({ tags: ["Android"] })).toBe("apps");
    expect(groupOf({ tags: ["Web"] })).toBe("web");
  });

  it("keeps rank order inside each group", () => {
    for (const g of getProjectGroups()) {
      const ranks = g.projects.map((p) => p.rank);
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    }
  });
});
