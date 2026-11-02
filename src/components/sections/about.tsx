/**
 * Purpose: About section: story (staggered), quick facts and the tech marquee.
 * Inputs: content/profile.ts, content/skills.ts, content/sections.ts.
 */
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { Stagger } from "@/components/motion/stagger";
import { StaggerItem } from "@/components/motion/stagger-item";
import { Portrait } from "@/components/ui/portrait";
import { Section } from "@/components/ui/section";
import { real } from "@/lib/content/real";
import { profilePhoto } from "@/lib/media";
import { profile } from "@content/profile";
import { sectionsCopy } from "@content/sections";
import { skills } from "@content/skills";

export function About() {
  const copy = sectionsCopy.about;
  const story = profile.about.story.map((p) => real(p)).filter((p): p is string => Boolean(p));
  const location = real(profile.location);
  const photo = real(profile.photo) ?? profilePhoto();

  return (
    <Section id="about" eyebrow={copy.eyebrow} title={copy.title}>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Stagger className="flex flex-col gap-5 text-lg text-fg-muted">
          {story.map((paragraph) => (
            <StaggerItem key={paragraph}>
              <p>{paragraph}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.15}>
          <div className="flex flex-col gap-6">
            {photo ? (
              <div className="scene-show mx-auto w-full max-w-xs">
                <Portrait src={photo} name={profile.name} />
              </div>
            ) : null}
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
        </Reveal>
      </div>
      <h3 className="mb-4 mt-14 font-display text-lg font-semibold">{copy.stackTitle}</h3>
      <Reveal>
        <Marquee items={skills.map((s) => s.name)} label={copy.stackTitle} />
      </Reveal>
    </Section>
  );
}
