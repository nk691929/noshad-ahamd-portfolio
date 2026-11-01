/**
 * Purpose: the NexyMark business line (WhatsApp + calls) and the choices shown in the contact form.
 * EDIT THIS FILE to change the number, greeting or any option. Options are plain text and are validated on the server.
 * TODO(owner): confirm the phone digits. Pakistani mobile numbers normally have 11 digits (03XX XXXXXXX);
 * the number supplied has 12. Open the WhatsApp button on your phone before publishing.
 * Used by: contact section, contact form, floating WhatsApp button, server action.
 */
import { contactContentSchema } from "@/lib/content/contact-schema";

export const contactContent = contactContentSchema.parse({
  business: {
    name: "NexyMark",
    url: "https://nexymark.com",
    line: "Every project I take on runs through NexyMark. Message or call the NexyMark line below.",
  },
  phone: "03087121091",
  phoneDisplay: "0308 7121 091",
  countryCode: "92",
  whatsappGreeting: "Hi Noshad, I found your portfolio and would like to talk about a project.",
  options: {
    projectTypes: ["Website", "Mobile app", "Website + mobile app", "Not sure yet"],
    // Ranges are placeholders. Edit them to match your real pricing.
    budgets: [
      "Under $500",
      "$500 to $1,500",
      "$1,500 to $5,000",
      "$5,000 or more",
      "I will decide later",
    ],
    timelines: ["As soon as possible", "Within a month", "Flexible"],
  },
});
