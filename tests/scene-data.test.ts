/**
 * Purpose: the data handed to the 3D scene is complete: one hero slide plus the showcase projects, and a bounded,
 * duplicate-free technology list drawn from the skills content.
 */
import { describe, expect, it } from "vitest";
import { SHOWCASE_COUNT, getSceneData, getShowcaseProjects } from "@/lib/scene-data";

describe("getSceneData", () => {
  const data = getSceneData();

  it("has a hero slide followed by the showcase projects", () => {
    expect(data.slides).toHaveLength(1 + SHOWCASE_COUNT);
    expect(data.slides[0]?.title).toBe("Noshad Ahmad");
    expect(data.slides.slice(1).map((s) => s.title)).toEqual(
      getShowcaseProjects().map((p) => p.title),
    );
  });

  it("lists up to 12 unique technologies", () => {
    const names = data.tech.map((t) => t.name);
    expect(names.length).toBeGreaterThan(3);
    expect(names.length).toBeLessThanOrEqual(12);
    expect(new Set(names).size).toBe(names.length);
  });
});
