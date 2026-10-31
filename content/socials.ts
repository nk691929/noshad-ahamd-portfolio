/**
 * Purpose: social/contact links. EDIT THIS FILE to add or change links.
 * Used by: contact section, footer, nav, SEO (JSON-LD sameAs).
 */
import { socialSchema } from "@/lib/content/schemas";
import { todo } from "@/lib/content/todo";
import { z } from "zod";

export const socials = z.array(socialSchema).parse([
  { id: "github", label: "GitHub", url: "https://github.com/nk691929" },
  // Built from the LinkedIn handle in the brief; confirm it opens your profile.
  { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/noshad-ahmad-ramdani" },
  { id: "email", label: "Email", url: todo("mailto link or leave until email is supplied") },
]);
