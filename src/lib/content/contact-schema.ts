/**
 * Purpose: Zod schema for content/contact.ts (business line, phone, and the options shown in the contact form).
 * Used by: content/contact.ts, lib/contact.ts (type only), tests.
 */
import { z } from "zod";

const options = z.array(z.string().min(1)).min(2);

export const contactContentSchema = z.object({
  business: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    line: z.string().min(1),
  }),
  /** local number, digits only, with the leading 0 (for example 03001234567) */
  phone: z.string().regex(/^\d{10,13}$/, "digits only, 10 to 13 digits, for example 03001234567"),
  /** how the number is shown on the page (digits grouped however you like) */
  phoneDisplay: z.string().min(1),
  /** country code without plus (Pakistan = 92) */
  countryCode: z.string().regex(/^\d{1,3}$/),
  whatsappGreeting: z.string().min(1),
  options: z.object({ projectTypes: options, budgets: options, timelines: options }),
});

export type ContactContent = z.infer<typeof contactContentSchema>;
