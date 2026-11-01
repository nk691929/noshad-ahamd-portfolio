"use server";

/**
 * Purpose: server action for the contact form. Validates with Zod (choices must come from content/contact.ts),
 * ignores bots (honeypot), sends via the Resend REST API when env vars are set, otherwise returns a mailto fallback.
 * Inputs: FormData (name, email, phone, projectType, budget, timeline, message, hidden "company" honeypot).
 * Used by: contact-form.tsx.
 */
import { createContactSchema } from "@/lib/contact";
import { getEnv } from "@/lib/env";
import { real } from "@/lib/content/real";
import {
  buildInquiryText,
  type ContactField,
  type ContactState,
  type ContactValues,
} from "@/lib/inquiry";
import { contactContent } from "@content/contact";
import { profile } from "@content/profile";

const schema = createContactSchema(contactContent.options);
const FIELDS: ContactField[] = [
  "name",
  "email",
  "phone",
  "projectType",
  "budget",
  "timeline",
  "message",
];

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: real users never fill this. Pretend success so bots learn nothing.
  if (String(formData.get("company") ?? "") !== "")
    return { status: "success", message: "Thanks!" };

  const values = Object.fromEntries(
    FIELDS.map((f) => [f, String(formData.get(f) ?? "")]),
  ) as ContactValues;

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ContactField | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const data = parsed.data;
  const text = buildInquiryText(data, "New inquiry from the portfolio");
  const subject = `Portfolio inquiry: ${data.projectType} from ${data.name}`.replace(
    /[\r\n]+/g,
    " ",
  );
  const to = real(profile.email);
  const env = getEnv();

  if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.CONTACT_FROM_EMAIL) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: [env.CONTACT_TO_EMAIL],
          reply_to: data.email,
          subject,
          text,
        }),
      });
      if (res.ok)
        return { status: "success", message: "Thanks! Your message was sent. I will reply soon." };
    } catch {
      // fall through to the mailto fallback
    }
  }

  if (to) {
    return {
      status: "fallback",
      message:
        "I could not send this automatically. Use the button to send it from your email app.",
      mailto: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
      values,
    };
  }
  return { status: "error", message: "Contact is not configured yet.", values };
}
