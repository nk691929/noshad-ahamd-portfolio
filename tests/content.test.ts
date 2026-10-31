/**
 * Purpose: guard the content layer. Importing content/*.ts already runs Zod validation;
 * these tests add cross-file rules (unique slugs, case-study files match projects, placeholder helpers).
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { experience } from "@content/experience";
import { profile } from "@content/profile";
import { projects } from "@content/projects";
import { skills } from "@content/skills";
import { socials } from "@content/socials";
import { caseStudyFrontmatterSchema } from "@/lib/content/schemas";
import { isTodo, todo } from "@/lib/content/todo";

const caseDir = path.resolve(process.cwd(), "content", "case-studies");
const caseFiles = readdirSync(caseDir).filter((f) => f.endsWith(".mdx"));

describe("placeholder helpers", () => {
  it("creates and detects TODO(owner) values", () => {
    expect(isTodo(todo("x"))).toBe(true);
    expect(isTodo("real value")).toBe(false);
  });
});

describe("content files", () => {
  it("parse and are non-empty", () => {
    expect(profile.name).toBe("Noshad Ahmad");
    expect(projects.length).toBeGreaterThan(0);
    expect(skills.length).toBeGreaterThan(0);
    expect(socials.length).toBeGreaterThan(0);
    expect(experience.length).toBeGreaterThan(0);
  });

  it("has unique project slugs and skill names", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const names = skills.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("does not assign the AI tag to any project until the owner confirms one", () => {
    expect(projects.some((p) => p.tags.includes("AI"))).toBe(false);
  });
});

describe("case studies", () => {
  it("every .mdx file matches a project with caseStudy=true and has valid frontmatter", () => {
    for (const file of caseFiles) {
      const slug = file.replace(/\.mdx$/, "");
      const project = projects.find((p) => p.slug === slug);
      expect(project, `no project for ${file}`).toBeDefined();
      expect(project?.caseStudy, `${slug} must set caseStudy: true`).toBe(true);
      const { data } = matter(readFileSync(path.join(caseDir, file), "utf8"));
      expect(() => caseStudyFrontmatterSchema.parse(data)).not.toThrow();
    }
  });

  it("every project with caseStudy=true has an .mdx file", () => {
    for (const p of projects.filter((x) => x.caseStudy)) {
      expect(caseFiles, `missing content/case-studies/${p.slug}.mdx`).toContain(`${p.slug}.mdx`);
    }
  });
});
