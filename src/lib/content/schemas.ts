/**
 * Purpose: Zod schemas + inferred types for everything in /content. Invalid content fails at
 * build/test time, so editing /content can never silently break the UI.
 * Inputs: raw objects from content/*.ts. Used by: content/*.ts, loaders, tests.
 */
import { z } from "zod";
import { TODO_PREFIX } from "./todo";

/** A string that is explicitly an unfilled placeholder. */
const todoText = z.string().refine((v) => v.startsWith(TODO_PREFIX), {
  message: `Expected a real value or a ${TODO_PREFIX} placeholder`,
});

/** A real value of schema `s`, or a TODO(owner) placeholder. */
const todoOr = <T extends z.ZodType>(s: T) => z.union([s, todoText]);

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case slug expected");

export const PROJECT_TAGS = ["Flutter", "Web", "Android", "Mobile", "AI"] as const;
export const SKILL_TIERS = ["core", "proficient", "familiar"] as const;
export const SKILL_GROUPS = ["Mobile", "Backend", "Web", "Tools"] as const;

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  tagline: z.string().min(1),
  pitch: z.string().min(1),
  roles: z.array(z.string().min(1)).min(1), // rotating hero line
  availability: todoOr(z.string().min(1)),
  location: todoOr(z.string().min(1)),
  email: todoOr(z.string().email()),
  photo: todoOr(z.string().startsWith("/")),
  resume: todoOr(z.string().startsWith("/")),
  about: z.object({
    story: z.array(z.string().min(1)).min(1), // paragraphs
    facts: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
});

export const socialSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: todoOr(z.string().url()),
});

export const skillSchema = z.object({
  name: z.string().min(1),
  group: z.enum(SKILL_GROUPS),
  tier: z.enum(SKILL_TIERS),
  /** false = tier is provisional until the owner confirms it */
  confirmed: z.boolean(),
});

export const projectSchema = z.object({
  slug,
  /** display order: 1 = shown first. Must be unique across projects. */
  rank: z.number().int().positive(),
  title: z.string().min(1),
  summary: todoOr(z.string().min(1)),
  tags: z.array(z.enum(PROJECT_TAGS)).min(1),
  stack: z.array(z.string().min(1)).min(1),
  featured: z.boolean(),
  role: todoOr(z.string().min(1)),
  period: todoOr(z.string().min(1)),
  cover: todoOr(z.string().startsWith("/")),
  links: z.object({
    github: todoOr(z.string().url()),
    live: todoOr(z.string().url()),
  }),
  /** true = content/case-studies/<slug>.mdx must exist */
  caseStudy: z.boolean(),
  /** client name for client work (get the client's permission before showing it) */
  client: z.string().min(1).optional(),
  /** omit when unknown */
  status: z.enum(["live", "in-progress", "archived"]).optional(),
});

export const experienceSchema = z.object({
  id: slug,
  kind: z.enum(["work", "education"]),
  title: todoOr(z.string().min(1)),
  organization: todoOr(z.string().min(1)),
  period: todoOr(z.string().min(1)),
  summary: todoOr(z.string().min(1)),
});

export const caseStudyFrontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
});

export type Profile = z.infer<typeof profileSchema>;
export type Social = z.infer<typeof socialSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectTag = (typeof PROJECT_TAGS)[number];
export type Experience = z.infer<typeof experienceSchema>;
export type CaseStudyFrontmatter = z.infer<typeof caseStudyFrontmatterSchema>;
