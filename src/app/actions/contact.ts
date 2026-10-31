"use server";

/**
 * Purpose: server action for the contact form. Validates with Zod, ignores bots (honeypot), sends via the
 * Resend REST API when env vars are set, otherwise returns a mailto fallback. No secrets reach the client.
 * Inputs: FormData (name, email, message, hidden "company" honeypot). Used by: contact-form.tsx.
 */
import { contactSchema, type ContactField, type ContactState } from "@/lib/contact";
import { getEnv } from "@/lib/env";
import { real } from "@/lib/content/real";
import { profile } from "@content/profile";

function mailtoUrl(to: string, name: string, email: string, message: string): string {
  const subject = `Portfolio inquiry from ${name}`;
  const body = `${message}\n\n${name} <${email}>`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: real users never fill this. Pretend success so bots learn nothing.
  if (String(formData.get("company") ?? "") !== "")
    return { status: "success", message: "Thanks!" };

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ContactField | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const { name, email, message } = parsed.data;
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
          reply_to: email,
          subject: `Portfolio inquiry from ${name.replace(/[\r\n]+/g, " ")}`,
          text: `${message}\n\nFrom: ${name} <${email}>`,
        }),
      });
      if (res.ok) return { status: "success", message: "Thanks! Your message was sent." };
    } catch {
      // fall through to the mailto fallback
    }
  }

  if (to) {
    return {
      status: "fallback",
      message:
        "I could not send this automatically. Use the button to send it from your email app.",
      mailto: mailtoUrl(to, name, email, message),
      values,
    };
  }
  return { status: "error", message: "Contact is not configured yet.", values };
}
