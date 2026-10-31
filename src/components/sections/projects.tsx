/**
 * Purpose: Projects section. Ranks projects, finds the tags in use, and hands plain data to the client grid.
 * Inputs: content/projects.ts (via lib/projects.ts), content/sections.ts. Card links to case studies appear in step 6.
 */
import { ProjectsGrid } from "@/components/ui/projects-grid";
import { Section } from "@/components/ui/section";
import { getProjectTags, getProjects } from "@/lib/projects";
import { CASE_STUDY_ROUTES_READY } from "@/lib/site";
import { sectionsCopy } from "@content/sections";

export function Projects() {
  const copy = sectionsCopy.projects;
  return (
    <Section id="projects" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      <ProjectsGrid
        projects={getProjects()}
        tags={getProjectTags()}
        allLabel={copy.all}
        caseStudyLabel={copy.caseStudy}
        caseStudiesReady={CASE_STUDY_ROUTES_READY}
      />
    </Section>
  );
}
