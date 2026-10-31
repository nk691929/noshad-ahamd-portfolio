/**
 * Purpose: all portfolio projects. TO ADD ONE: copy an entry, change slug/title/tags, done.
 * Summaries/stacks come from the owner brief only; links, roles, dates and covers are TODO(owner).
 * `featured` choices are provisional (TODO(owner): pick the projects to feature).
 * Used by: projects section (bento + filters), case-study pages, sitemap, SEO.
 */
import { projectSchema } from "@/lib/content/schemas";
import { todo } from "@/lib/content/todo";
import { z } from "zod";

const placeholders = {
  role: todo("your role on this project"),
  period: todo("when it was built"),
  cover: todo("cover image path in /public/images"),
  links: { github: todo("GitHub repo URL"), live: todo("live URL or store link") },
};

export const projects = z.array(projectSchema).parse([
  {
    slug: "chat-app",
    title: "Chat App",
    summary: "Real-time chat app built with Flutter and Firebase.",
    tags: ["Flutter"],
    stack: ["Flutter", "Dart", "Firebase"],
    featured: true,
    caseStudy: true,
    ...placeholders,
  },
  {
    slug: "dopareels",
    title: "DopaReels",
    summary: "TikTok-style short-video app with chat.",
    tags: ["Mobile"],
    stack: ["React Native", "Expo", "TypeScript", "Supabase"],
    featured: true,
    caseStudy: false,
    ...placeholders,
  },
  {
    slug: "cattle-management",
    title: "Cattle Management",
    summary: "Flutter web app for tracking cattle.",
    tags: ["Flutter", "Web"],
    stack: ["Flutter", "Dart"],
    featured: true,
    caseStudy: false,
    ...placeholders,
  },
  {
    slug: "iiui-gpa-calculator",
    title: "IIUI GPA Calculator",
    summary: "Native Android app for calculating GPA.",
    tags: ["Android"],
    stack: ["Android", "Java"],
    featured: false,
    caseStudy: false,
    ...placeholders,
  },
  {
    slug: "words-counter",
    title: "Words Counter",
    summary: "HTML tool with word count, read-time estimate, case conversion and text-to-speech.",
    tags: ["Web"],
    stack: ["HTML"],
    featured: false,
    caseStudy: false,
    ...placeholders,
  },
  {
    slug: "cashledger",
    title: "CashLedger",
    summary: todo("one-line description"),
    tags: ["Android"],
    stack: ["Java"],
    featured: false,
    caseStudy: false,
    ...placeholders,
  },
  {
    slug: "lighton",
    title: "LightOn",
    summary: todo("one-line description"),
    tags: ["Android"],
    stack: ["Java"],
    featured: false,
    caseStudy: false,
    ...placeholders,
  },
]);
