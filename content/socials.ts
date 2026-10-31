/**
 * Purpose: social links. EDIT THIS FILE to add or change links. (Email lives in content/profile.ts.)
 * Used by: contact section, footer, nav, SEO (JSON-LD sameAs).
 */
import { socialSchema } from "@/lib/content/schemas";
import { z } from "zod";

export const socials = z.array(socialSchema).parse([
  { id: "github", label: "GitHub", url: "https://github.com/nk691929" },
  { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/noshad-ahmad-ramdani" },
]);
