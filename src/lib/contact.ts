/**
 * Purpose: Zod schema for the contact form. The allowed project types, budgets and timelines come from
 * content/contact.ts, so the server rejects values the form never offered. Server/test use only.
 * Used by: src/app/actions/contact.ts, tests.
 */
import { z } from "zod";
import type { ContactContent } from "@/lib/content/contact-schema";

const oneOf = (allowed: readonly string[], message: string) =>
  z.string().refine((v) => allowed.includes(v), message);

export function createContactSchema(options: ContactContent["options"]) {
  return z.object({
    name: z.string().trim().min(2, "Please enter your name").max(80),
    email: z.string().trim().email("Please enter a valid email").max(120),
    phone: z
      .string()
      .trim()
      .max(30)
      .regex(/^$|^\+?[\d\s-]{7,}$/, "Please enter a valid phone number or leave it empty"),
    projectType: oneOf(options.projectTypes, "Please choose what you need"),
    budget: oneOf(options.budgets, "Please choose a budget, or pick the decide-later option"),
    timeline: z
      .string()
      .trim()
      .refine((v) => v === "" || options.timelines.includes(v), "Please choose a timeline"),
    message: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
  });
}
