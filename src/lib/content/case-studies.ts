/**
 * Purpose: server-side loader for MDX case studies in /content/case-studies.
 * Inputs: slug (validated kebab-case, blocks path traversal). Output: validated frontmatter + rendered MDX.
 * Used by: case-study routes (step 6), sitemap (step 7). Content is owner-authored; MDX can run JS.
 */
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";
import { caseStudyFrontmatterSchema } from "./schemas";

const DIR = path.join(process.cwd(), "content", "case-studies");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function getCaseStudySlugs(): Promise<string[]> {
  const files = await fs.readdir(DIR);
  return files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

export async function getCaseStudy(
  slug: string,
  components: ComponentProps<typeof compileMDX>["components"] = {},
) {
  if (!SLUG.test(slug)) return null;
  let raw: string;
  try {
    raw = await fs.readFile(path.join(DIR, `${slug}.mdx`), "utf8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  const frontmatter = caseStudyFrontmatterSchema.parse(data);
  const { content: body } = await compileMDX({ source: content, components });
  return { slug, frontmatter, body };
}
