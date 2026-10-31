/**
 * Purpose: experience + education timeline. Entries below are placeholders until the owner supplies details.
 * TODO(owner): replace every placeholder; add one object per role/degree.
 * Used by: experience section.
 */
import { experienceSchema } from "@/lib/content/schemas";
import { todo } from "@/lib/content/todo";
import { z } from "zod";

export const experience = z.array(experienceSchema).parse([
  {
    id: "work-1",
    kind: "work",
    title: todo("role title"),
    organization: todo("employer / client / 'Freelance'"),
    period: todo("start - end"),
    summary: todo("2 lines on what you did"),
  },
  {
    id: "education-1",
    kind: "education",
    title: todo("degree / program"),
    organization: todo("institution"),
    period: todo("start - end"),
    summary: todo("optional highlights"),
  },
]);
