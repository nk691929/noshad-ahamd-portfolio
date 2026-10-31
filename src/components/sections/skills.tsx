/**
 * Purpose: Skills section grouped by area with tier dots (no percentages). Dot fill animation is added in step 5.
 * Inputs: content/skills.ts, content/sections.ts.
 */
import { Section } from "@/components/ui/section";
import { TierDots } from "@/components/ui/tier-dots";
import { SKILL_GROUPS } from "@/lib/content/schemas";
import { sectionsCopy } from "@content/sections";
import { skills } from "@content/skills";

export function Skills() {
  const copy = sectionsCopy.skills;
  return (
    <Section id="skills" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      <div className="grid gap-4 md:grid-cols-2">
        {SKILL_GROUPS.map((group) => {
          const items = skills.filter((s) => s.group === group);
          if (items.length === 0) return null;
          return (
            <article key={group} className="glass rounded-lg p-6">
              <h3 className="font-display text-h3">{group}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {items.map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-4">
                    <span>{s.name}</span>
                    <TierDots tier={s.tier} label={copy.tiers[s.tier]} />
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-fg-muted">
        {copy.tiers.core}: 3 dots, {copy.tiers.proficient}: 2 dots, {copy.tiers.familiar}: 1 dot
      </p>
    </Section>
  );
}
