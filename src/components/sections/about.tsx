/**
 * Purpose: About section: story, quick facts and tech list. Marquee treatment is added in step 5.
 * Inputs: content/profile.ts, content/skills.ts, content/sections.ts.
 */
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { real } from "@/lib/content/real";
import { profile } from "@content/profile";
import { sectionsCopy } from "@content/sections";
import { skills } from "@content/skills";

export function About() {
  const copy = sectionsCopy.about;
  const story = profile.about.story.map((p) => real(p)).filter((p): p is string => Boolean(p));
  const location = real(profile.location);

  return (
    <Section id="about" eyebrow={copy.eyebrow} title={copy.title}>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5 text-lg text-fg-muted">
          {story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside className="glass h-fit rounded-lg p-6" aria-labelledby="facts-title">
          <h3 id="facts-title" className="font-display text-lg font-semibold">
            {copy.factsTitle}
          </h3>
          <dl className="mt-4 flex flex-col gap-3">
            {location ? (
              <div>
                <dt className="text-sm text-fg-muted">Location</dt>
                <dd>{location}</dd>
              </div>
            ) : null}
            {profile.about.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm text-fg-muted">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
      <h3 className="mb-4 mt-14 font-display text-lg font-semibold">{copy.stackTitle}</h3>
      <ul className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <li key={s.name}>
            <Badge>{s.name}</Badge>
          </li>
        ))}
      </ul>
    </Section>
  );
}
