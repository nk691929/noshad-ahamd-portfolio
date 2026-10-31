/**
 * Purpose: contact form schema and state type, shared by the server action and the form component.
 * Used by: src/app/actions/contact.ts, contact-form.tsx, tests.
 */
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email").max(120),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
});

export type ContactField = "name" | "email" | "message";

export type ContactState = {
  status: "idle" | "success" | "error" | "fallback";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  mailto?: string;
  values?: Record<ContactField, string>;
};
