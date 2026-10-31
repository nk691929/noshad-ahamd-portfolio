/**
 * Purpose: skills grouped for the Skills section (tiers, never percentages).
 * EDIT THIS FILE to add/move skills. `confirmed: false` means the TIER is provisional.
 * TODO(owner): confirm or change every tier where confirmed is false.
 * Used by: skills section, about marquee.
 */
import { skillSchema } from "@/lib/content/schemas";
import { z } from "zod";

export const skills = z.array(skillSchema).parse([
  // Mobile
  { name: "Flutter", group: "Mobile", tier: "core", confirmed: true },
  { name: "Dart", group: "Mobile", tier: "core", confirmed: true },
  { name: "Android (Java)", group: "Mobile", tier: "proficient", confirmed: false },
  { name: "React Native (Expo)", group: "Mobile", tier: "proficient", confirmed: false },
  // Backend
  { name: "Firebase", group: "Backend", tier: "proficient", confirmed: false },
  { name: "Supabase", group: "Backend", tier: "proficient", confirmed: false },
  // Web
  { name: "Next.js", group: "Web", tier: "proficient", confirmed: false },
  { name: "React", group: "Web", tier: "proficient", confirmed: false },
  { name: "TypeScript", group: "Web", tier: "proficient", confirmed: false },
  { name: "HTML", group: "Web", tier: "proficient", confirmed: false },
  // Tools
  { name: "Git & GitHub", group: "Tools", tier: "proficient", confirmed: false },
]);
