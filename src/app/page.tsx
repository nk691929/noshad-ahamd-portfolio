/**
 * Purpose: home page. Composes the sections in order; all copy comes from /content.
 * Revalidates hourly so the GitHub block stays fresh. Used by: route "/".
 */
import { About } from "@/components/sections/about";
import { Comments } from "@/components/sections/comments";
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
import { JsonLd } from "@/components/seo/json-ld";
import { MusicPlayer } from "@/components/ui/music-player";
import { WhatsAppFab } from "@/components/ui/whatsapp-fab";
import { ambientAudio } from "@/lib/media";
import { getSceneData } from "@/lib/scene-data";
import { structuredData } from "@/lib/seo";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <JsonLd data={structuredData()} />
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <ProjectShowcase />
        <Projects />
        <Experience />
        <GithubActivity />
        <Comments />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
      <MusicPlayer {...(ambientAudio() ? { src: ambientAudio() } : {})} />
      <SceneLoader data={getSceneData()} />
    </>
  );
}
