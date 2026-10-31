/**
 * Purpose: experience + education timeline. Source: owner résumé.
 * EDIT THIS FILE: one object per role/degree. Used by: experience section.
 */
import { experienceSchema } from "@/lib/content/schemas";
import { z } from "zod";

export const experience = z.array(experienceSchema).parse([
  {
    id: "freelance-flutter",
    kind: "work",
    title: "Flutter Developer",
    organization: "Self-employed / Freelance (Remote)",
    period: "Feb 2024 - Present",
    summary:
      "Designing and building Flutter apps with Clean Architecture and Riverpod, integrating REST APIs with Dio and Firebase (Auth, Firestore), with a disciplined Git workflow: conventional commits, feature-branch PRs and CI-gated merges.",
  },
  {
    id: "bs-software-engineering",
    kind: "education",
    title: "BS Software Engineering",
    organization: "International Islamic University, Islamabad",
    period: "2020 - 2024",
    summary: "CGPA 3.2 / 4.0. 1st position in the Speed Programming Competition, IIUI.",
  },
]);
