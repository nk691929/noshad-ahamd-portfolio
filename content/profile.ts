/**
 * Purpose: owner profile and About copy. EDIT THIS FILE to change identity/hero/about text.
 * Source of truth: owner brief + résumé. Unknown values are TODO(owner) placeholders; never invent.
 * Do NOT add a phone number here (the site is public).
 * Used by: hero, about, contact, footer, SEO (JSON-LD) sections.
 */
import { profileSchema } from "@/lib/content/schemas";
import { todo } from "@/lib/content/todo";

export const profile = profileSchema.parse({
  name: "Noshad Ahmad",
  headline: "Flutter Developer | Firebase Enthusiast | Tech Explorer",
  tagline: "I build apps that solve problems and make life easier.",
  pitch:
    "Flutter developer building production-style, offline-first mobile apps with Clean Architecture and Riverpod, backed by REST APIs or Firebase. I also ship web products with TypeScript.",
  roles: [
    "Flutter apps",
    "Offline-first mobile products",
    "Firebase-backed products",
    "AI-powered web products",
  ],
  availability: todo("availability line for the hero badge, or remove the badge"),
  location: "Islamabad, Pakistan",
  email: "noshadramdani@gmail.com",
  photo: todo("portrait path in /public/images, e.g. /images/noshad.jpg"),
  resume: todo(
    "résumé PDF path in /public, e.g. /resume.pdf (use a copy without your phone number)",
  ),
  about: {
    story: [
      "I am a Flutter developer who builds production-style, offline-first mobile apps using Clean Architecture, Riverpod, and both REST and Firebase backends.",
      "I like owning a feature end to end: the data layer, sync and conflict handling, state management and UI. I have worked as a freelance Flutter developer since February 2024.",
      "Beyond Flutter I build web products with TypeScript and Next.js, including AI-powered websites, and I have worked with native Android in Java, React Native with Expo, and Supabase.",
      todo("optional personal paragraph: what drives you, how you work, what you want next"),
    ],
    facts: [
      { label: "Focus", value: "Flutter / Dart mobile apps" },
      { label: "Freelance since", value: "February 2024" },
      { label: "Architecture", value: "Clean Architecture, Riverpod" },
      { label: "Also builds", value: "Web products with TypeScript and Next.js" },
      { label: "Education", value: "BS Software Engineering, IIUI" },
    ],
  },
});
