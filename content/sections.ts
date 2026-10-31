/**
 * Purpose: marketing copy for section headings, intros and CTAs, so components hold no hard-coded copy.
 * EDIT THIS FILE to reword headings. (Tiny UI chrome like aria-labels and form labels stays in components.)
 * Used by: every section component and the nav.
 */
export const sectionsCopy = {
  nav: [
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "contact", label: "Contact" },
  ],
  hero: {
    rolePrefix: "I build",
    primaryCta: "View work",
    secondaryCta: "Contact",
    resume: "Résumé",
  },
  about: {
    eyebrow: "About",
    title: "A bit about me",
    factsTitle: "Quick facts",
    stackTitle: "Tech I work with",
  },
  skills: {
    eyebrow: "Skills",
    title: "What I work with",
    intro: "Grouped by area. The dots show how central each skill is to my work.",
    tiers: { core: "Core", proficient: "Proficient", familiar: "Familiar" },
  },
  projects: {
    eyebrow: "Projects",
    title: "Selected work",
    intro: "My strongest work first. Filter by type.",
    all: "All",
    caseStudy: "Read case study",
  },
  experience: { eyebrow: "Experience", title: "Experience and education" },
  github: {
    eyebrow: "GitHub",
    title: "Activity on GitHub",
    intro: "A snapshot of my public repositories, refreshed hourly.",
    viewProfile: "View profile",
  },
  contact: {
    eyebrow: "Contact",
    title: "Get in touch",
    intro: "Have a project or role in mind? Send a message and I will reply by email.",
  },
} as const;
