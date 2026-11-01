/**
 * Purpose: contact form types and the inquiry text builder (used for email, mailto and WhatsApp messages).
 * No Zod here, so client components can import it without bloating the bundle.
 * Used by: contact-form.tsx, the contact server action, lib/contact.ts, tests.
 */

export type ContactField =
  "name" | "email" | "phone" | "projectType" | "budget" | "timeline" | "message";

export type ContactValues = Record<ContactField, string>;

export type ContactState = {
  status: "idle" | "success" | "error" | "fallback";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  mailto?: string;
  values?: ContactValues;
};

/** Builds a readable multi-line message; empty fields are skipped so it also works for half-filled forms. */
export function buildInquiryText(values: Partial<ContactValues>, greeting: string): string {
  const lines = [greeting, ""];
  const add = (label: string, value: string | undefined) => {
    if (value && value.trim()) lines.push(`${label}: ${value.trim()}`);
  };
  add("Name", values.name);
  add("Looking for", values.projectType);
  add("Budget", values.budget);
  add("Timeline", values.timeline);
  add("Email", values.email);
  add("Phone", values.phone);
  if (values.message && values.message.trim()) lines.push("", values.message.trim());
  return lines.join("\n");
}
