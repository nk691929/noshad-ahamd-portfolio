/**
 * Purpose: skills grouped for the Skills section (tiers, never percentages).
 * Source: owner résumé. EDIT THIS FILE to add/move skills. `confirmed: false` means the TIER is
 * provisional. TODO(owner): confirm or change every tier where confirmed is false.
 * Used by: skills section, about marquee.
 */
import { skillSchema } from "@/lib/content/schemas";
import { z } from "zod";

export const skills = z.array(skillSchema).parse([
  // Mobile
  { name: "Flutter", group: "Mobile", tier: "core", confirmed: true },
  { name: "Dart", group: "Mobile", tier: "core", confirmed: true },
  { name: "Riverpod", group: "Mobile", tier: "proficient", confirmed: false },
  { name: "Provider", group: "Mobile", tier: "proficient", confirmed: false },
  { name: "Bloc", group: "Mobile", tier: "familiar", confirmed: true }, // résumé: "working knowledge"
  { name: "go_router", group: "Mobile", tier: "proficient", confirmed: false },
  { name: "Clean Architecture", group: "Mobile", tier: "proficient", confirmed: false },
  { name: "Offline-first sync (Hive)", group: "Mobile", tier: "proficient", confirmed: false },
  { name: "Android (Java)", group: "Mobile", tier: "familiar", confirmed: false },
  { name: "React Native (Expo)", group: "Mobile", tier: "familiar", confirmed: false },
  // Backend
  { name: "Firebase (Auth, Firestore)", group: "Backend", tier: "proficient", confirmed: false },
  { name: "REST APIs (Dio)", group: "Backend", tier: "proficient", confirmed: false },
  { name: "Supabase", group: "Backend", tier: "familiar", confirmed: false },
  // Web
  { name: "TypeScript", group: "Web", tier: "proficient", confirmed: false },
  { name: "Next.js", group: "Web", tier: "proficient", confirmed: false },
  { name: "React", group: "Web", tier: "proficient", confirmed: false },
  { name: "HTML", group: "Web", tier: "proficient", confirmed: false },
  // Tools
  { name: "Git & GitHub", group: "Tools", tier: "proficient", confirmed: false },
  { name: "GitHub Actions CI", group: "Tools", tier: "proficient", confirmed: false },
  { name: "Flutter testing", group: "Tools", tier: "proficient", confirmed: false },
  { name: "Figma", group: "Tools", tier: "familiar", confirmed: false },
]);
