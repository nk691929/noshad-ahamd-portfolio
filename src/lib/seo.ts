/**
 * Purpose: everything SEO in one place: the canonical site URL, Next.js metadata (title, description, Open Graph,
 * Twitter, robots, canonical) and the JSON-LD structured data (Person + WebSite + ProfilePage + project list).
 * All values come from /content, so editing content updates SEO too. Server only.
 * Used by: src/app/layout.tsx, page.tsx, sitemap.ts, robots.ts, opengraph-image.tsx.
 */
import type { Metadata, Viewport } from "next";
import { real } from "@/lib/content/real";
import { profilePhoto } from "@/lib/media";
import { getProjects } from "@/lib/projects";
import { profile } from "@content/profile";
import { skills } from "@content/skills";
import { socials } from "@content/socials";

const FALLBACK = "https://www.noshadahmad.com";

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const unusable =
    !configured ||
    (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/.test(configured));
  return (unusable ? FALLBACK : configured).replace(/\/$/, "");
}

export const SITE_URL = resolveSiteUrl();

const TITLE = `${profile.name} | Flutter Developer`;

const KEYWORDS = [
  profile.name,
  "Flutter developer",
  "Dart developer",
  "Flutter developer Islamabad",
  "Flutter developer Pakistan",
  "mobile app developer",
  "Firebase",
  "Riverpod",
  "Next.js developer",
  "TypeScript",
  "freelance developer",
  "NexyMark",
];

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07080b" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
  ],
};

export function siteMetadata(): Metadata {
  const verification = process.env.GOOGLE_SITE_VERIFICATION;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: TITLE, template: `%s | ${profile.name}` },
    description: `${profile.pitch} Based in ${real(profile.location) ?? "Pakistan"}.`,
    applicationName: profile.name,
    authors: [{ name: profile.name, url: SITE_URL }],
    creator: profile.name,
    keywords: KEYWORDS,
    category: "technology",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: profile.name,
      title: TITLE,
      description: profile.pitch,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: TITLE, description: profile.pitch },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    ...(verification ? { verification: { google: verification } } : {}),
  };
}

export function structuredData() {
  const sameAs = socials.map((s) => real(s.url)).filter((u): u is string => Boolean(u));
  const photo = real(profile.photo) ?? profilePhoto();
  const [locality, country] = (real(profile.location) ?? "").split(",").map((p) => p.trim());
  const personId = `${SITE_URL}/#person`;
  const email = real(profile.email);

  const list = getProjects()
    .slice(0, 10)
    .map((p, i) => {
      const url = real(p.links.live) ?? real(p.links.github);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: p.title,
          ...(real(p.summary) ? { description: real(p.summary) } : {}),
          ...(url ? { url } : {}),
        },
      };
    });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: profile.name,
        jobTitle: "Flutter Developer",
        description: profile.pitch,
        url: SITE_URL,
        ...(photo ? { image: `${SITE_URL}${photo}` } : {}),
        ...(email ? { email } : {}),
        sameAs,
        ...(locality
          ? {
              address: {
                "@type": "PostalAddress",
                addressLocality: locality,
                ...(country ? { addressCountry: country } : {}),
              },
            }
          : {}),
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "International Islamic University, Islamabad",
        },
        knowsAbout: skills.map((s) => s.name),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: profile.name,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile`,
        url: SITE_URL,
        name: TITLE,
        mainEntity: { "@id": personId },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      { "@type": "ItemList", name: "Selected projects", itemListElement: list },
    ],
  };
}
