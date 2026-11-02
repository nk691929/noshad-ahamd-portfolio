/**
 * Purpose: home page. Composes the sections in order; all copy comes from /content.
 * Revalidates hourly so the GitHub block stays fresh. Used by: route "/".
 */
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { Footer } from "@/components/sections/footer";
import { GithubActivity } from "@/components/sections/github-activity";
import { Hero } from "@/components/sections/hero";
import { Nav } from "@/components/sections/nav";
import { ProjectShowcase } from "@/components/sections/project-showcase";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";
import { SceneLoader } from "@/components/scene/scene-loader";
import { WhatsAppFab } from "@/components/ui/whatsapp-fab";
import { getSceneData } from "@/lib/scene-data";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <ProjectShowcase />
        <Projects />
        <Experience />
        <GithubActivity />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
      <SceneLoader data={getSceneData()} />
    </>
  );
}
