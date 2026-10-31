/**
 * Purpose: owner profile and About copy. EDIT THIS FILE to change identity/hero/about text.
 * Source of truth: owner brief. Unknown values are TODO(owner) placeholders; never invent.
 * Used by: hero, about, contact, footer, SEO (JSON-LD) sections.
 */
import { profileSchema } from "@/lib/content/schemas";
import { todo } from "@/lib/content/todo";

export const profile = profileSchema.parse({
  name: "Noshad Ahmad",
  headline: "Flutter Developer | Firebase Enthusiast | Tech Explorer",
  tagline: "I build apps that solve problems and make life easier.",
  pitch:
    "Flutter developer with about two years of experience building mobile and web apps, who also ships AI-powered websites with Next.js.",
  roles: ["Flutter apps", "Firebase-backed products", "AI-powered web products"],
  availability: todo("availability line for the hero badge, or remove the badge"),
  location: todo("city / country, or leave hidden"),
  email: todo("public contact email"),
  photo: todo("portrait path in /public/images, e.g. /images/noshad.jpg"),
  resume: todo("résumé PDF path, e.g. /resume.pdf"),
  about: {
    story: [
      "I am a Flutter and Dart developer with about two years of experience building mobile and web apps. I also build AI-powered websites with Next.js.",
      "Beyond Flutter I have worked with native Android in Java, React and React Native with Expo, Supabase and Firebase.",
      todo("a personal paragraph: what drives you, how you work, what you want next"),
    ],
    facts: [
      { label: "Focus", value: "Flutter / Dart mobile and web apps" },
      { label: "Experience", value: "About 2 years" },
      { label: "Also builds", value: "AI-powered websites with Next.js" },
    ],
  },
});
