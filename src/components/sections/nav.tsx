/**
 * Purpose: server wrapper that feeds profile + nav copy into the client NavBar.
 * Inputs: content/profile.ts, content/sections.ts. Used by: src/app/page.tsx.
 */
import { NavBar } from "@/components/ui/nav-bar";
import { real } from "@/lib/content/real";
import { profile } from "@content/profile";
import { sectionsCopy } from "@content/sections";

export function Nav() {
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const resume = real(profile.resume);
  return (
    <NavBar
      brand={initials}
      items={sectionsCopy.nav}
      resumeLabel={sectionsCopy.hero.resume}
      {...(resume ? { resumeHref: resume } : {})}
    />
  );
}
