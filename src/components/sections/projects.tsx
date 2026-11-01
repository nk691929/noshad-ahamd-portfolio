/**
 * Purpose: Projects section, split into two groups: "Mobile apps" (Flutter first) and "Websites". Each group has its
 * own heading, intro, filters and bento grid. Grouping comes from lib/projects.ts (derived from tags).
 * Inputs: content/projects.ts, content/sections.ts. Case-study links appear in step 6.
 */
import { Reveal } from "@/components/motion/reveal";
import { ProjectsGrid } from "@/components/ui/projects-grid";
import { Section } from "@/components/ui/section";
import { getProjectGroups } from "@/lib/projects";
import { CASE_STUDY_ROUTES_READY } from "@/lib/site";
import { sectionsCopy } from "@content/sections";

export function Projects() {
  const copy = sectionsCopy.projects;
  const groups = getProjectGroups();

  return (
    <Section id="projects" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      <div className="flex flex-col gap-20">
        {groups.map((group) => {
          const text = copy.groups[group.id];
          return (
            <div key={group.id} id={`projects-${group.id}`} className="scroll-mt-24">
              <Reveal>
                <h3 className="font-display text-h3">{text.title}</h3>
                <p className="mb-8 mt-2 max-w-2xl text-fg-muted">{text.intro}</p>
              </Reveal>
              <ProjectsGrid
                projects={group.projects}
                tags={group.tags}
                label={text.title.toLowerCase()}
                allLabel={copy.all}
                caseStudyLabel={copy.caseStudy}
                caseStudiesReady={CASE_STUDY_ROUTES_READY}
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}
