/**
 * Purpose: experience + education timeline; entries stagger in. Entries whose title or organization is still a
 * placeholder are hidden. Inputs: content/experience.ts, content/sections.ts.
 */
import { Stagger } from "@/components/motion/stagger";
import { StaggerItem } from "@/components/motion/stagger-item";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { real } from "@/lib/content/real";
import { experience } from "@content/experience";
import { sectionsCopy } from "@content/sections";

export function Experience() {
  const copy = sectionsCopy.experience;
  const items = experience.filter((e) => real(e.title) && real(e.organization));
  if (items.length === 0) return null;

  return (
    <Section id="experience" eyebrow={copy.eyebrow} title={copy.title}>
      <Stagger>
        <ol className="relative ml-2 border-l border-border-strong">
          {items.map((item) => {
            const period = real(item.period);
            const summary = real(item.summary);
            return (
              <li key={item.id} className="relative pb-10 pl-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent-2"
                />
                <StaggerItem>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-h3">{item.title}</h3>
                    <Badge>{item.kind === "work" ? "Work" : "Education"}</Badge>
                  </div>
                  <p className="mt-1 text-fg-muted">
                    {item.organization}
                    {period ? ` · ${period}` : ""}
                  </p>
                  {summary ? <p className="mt-3 max-w-2xl text-fg-muted">{summary}</p> : null}
                </StaggerItem>
              </li>
            );
          })}
        </ol>
      </Stagger>
    </Section>
  );
}
