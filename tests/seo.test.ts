/**
 * Purpose: SEO output is complete and consistent: canonical URL without a trailing slash, Open Graph and Twitter data,
 * Person structured data with the profile links, a robots file that points at the sitemap, and a sitemap with the home page.
 */
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { SITE_URL, siteMetadata, structuredData } from "@/lib/seo";

describe("seo", () => {
  it("has a clean absolute site URL", () => {
    expect(SITE_URL).toMatch(/^https?:\/\/[^/]+$/);
  });

  it("provides title, description, canonical and social cards", () => {
    const m = siteMetadata();
    expect(String((m.title as { default: string }).default)).toContain("Noshad Ahmad");
    expect((m.description ?? "").length).toBeGreaterThan(60);
    expect(m.alternates?.canonical).toBe("/");
    expect(m.openGraph).toMatchObject({ type: "website", url: SITE_URL });
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
    expect(m.robots).toMatchObject({ index: true, follow: true });
  });

  it("describes the person with their profile links", () => {
    const graph = (structuredData() as { "@graph": Record<string, unknown>[] })["@graph"];
    const person = graph.find((n) => n["@type"] === "Person") as {
      sameAs: string[];
      jobTitle: string;
      name: string;
    };
    expect(person.name).toBe("Noshad Ahmad");
    expect(person.jobTitle).toBe("Flutter Developer");
    expect(person.sameAs.some((u) => u.includes("github.com"))).toBe(true);
    expect(person.sameAs.some((u) => u.includes("linkedin.com"))).toBe(true);
    expect(graph.some((n) => n["@type"] === "WebSite")).toBe(true);
  });

  it("serves robots and a sitemap that include the home page", () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(sitemap().some((e) => e.url === SITE_URL)).toBe(true);
  });
});
