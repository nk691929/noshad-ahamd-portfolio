/**
 * Purpose: sitemap.xml. The home page, plus a page per case study once the case-study routes exist
 * (CASE_STUDY_ROUTES_READY in lib/site.ts). Add new public pages here.
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { CASE_STUDY_ROUTES_READY } from "@/lib/site";
import { projects } from "@content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const caseStudies = CASE_STUDY_ROUTES_READY
    ? projects
        .filter((p) => p.caseStudy)
        .map((p) => ({
          url: `${SITE_URL}/projects/${p.slug}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }))
    : [];
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...caseStudies,
  ];
}
