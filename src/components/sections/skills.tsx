/**
 * Purpose: Skills section grouped by area; cards stagger in and tier dots pop in (no percentages).
 * Inputs: content/skills.ts, content/sections.ts.
 */
import { Stagger } from "@/components/motion/stagger";
import { StaggerItem } from "@/components/motion/stagger-item";
import { Section } from "@/components/ui/section";
import { TierDots } from "@/components/ui/tier-dots";
import { SKILL_GROUPS } from "@/lib/content/schemas";
import { sectionsCopy } from "@content/sections";
import { skills } from "@content/skills";

export function Skills() {
  const copy = sectionsCopy.skills;
  return (
    <Section id="skills" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      <div className="scene-spacer scene-spacer--tall" aria-hidden="true" />
      <Stagger className="skills-grid grid gap-4 md:grid-cols-2">
        {SKILL_GROUPS.map((group) => {
          const items = skills.filter((s) => s.group === group);
          if (items.length === 0) return null;
          return (
            <StaggerItem key={group} className="h-full">
              <article className="glass h-full rounded-lg p-6">
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
            </StaggerItem>
          );
        })}
      </Stagger>
      <p className="mt-6 text-sm text-fg-muted">
        {copy.tiers.core}: 3 dots, {copy.tiers.proficient}: 2 dots, {copy.tiers.familiar}: 1 dot
      </p>
    </Section>
  );
}
