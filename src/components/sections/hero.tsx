/**
 * Purpose: hero with name, rotating role line, pitch, CTAs, optional portrait and a GPU-cheap animated background.
 * The staggered load sequence is pure CSS (.rise) so it runs at first paint. The portrait appears automatically when
 * public/images/profile.(jpg|webp|png|avif) exists (or content/profile.ts sets `photo`).
 * With the 3D scene OFF the animated portrait sits on the right (see ui/portrait.tsx). With the scene ON the portrait
 * moves to the About section and the fixed 3D laptop occupies the right (desktop) or the top (phones, via the spacer).
 * Inputs: content/profile.ts, content/sections.ts, content/skills.ts, lib/media.ts.
 */
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { Button } from "@/components/ui/button";
import { Portrait } from "@/components/ui/portrait";
import { RotatingRole } from "@/components/ui/rotating-role";
import { real } from "@/lib/content/real";
import { profilePhoto } from "@/lib/media";
import { cn } from "@/lib/utils";
import { profile } from "@content/profile";
import { sectionsCopy } from "@content/sections";
import { skills } from "@content/skills";

const step = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Hero() {
  const [first, ...rest] = profile.name.split(" ");
  const availability = real(profile.availability);
  const photo = real(profile.photo) ?? profilePhoto();
  const copy = sectionsCopy.hero;
  const chips = skills.filter((s) => s.tier === "core").slice(0, 2);

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh items-center overflow-hidden pb-16 pt-28"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="hero-grid" />
        <div className="hero-blob hero-blob--c" />
        <Parallax distance={120}>
          <div className="hero-blob hero-blob--a" />
        </Parallax>
        <Parallax distance={-80}>
          <div className="hero-blob hero-blob--b" />
        </Parallax>
      </div>
      <div
        className={cn(
          "mx-auto grid w-full max-w-6xl items-center gap-12 px-6",
          photo && "lg:grid-cols-[1.25fr_0.75fr]",
        )}
      >
        <div>
          <div className="scene-spacer" aria-hidden="true" />
          {availability ? (
            <p
              className="rise glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-fg-muted"
              style={step(0)}
            >
              <span className="h-2 w-2 rounded-full bg-accent-2" aria-hidden="true" />
              {availability}
            </p>
          ) : null}
          <h1 id="hero-title" className="rise font-display text-hero" style={step(1)}>
            {first} <span className="text-gradient">{rest.join(" ")}</span>
          </h1>
          <p className="rise mt-6 font-display text-h3" style={step(3)}>
            {copy.rolePrefix} <RotatingRole roles={profile.roles} />
          </p>
          <p className="rise mt-6 max-w-2xl text-lg text-fg-muted" style={step(4)}>
            {profile.pitch}
          </p>
          <div className="rise mt-10 flex flex-wrap gap-4" style={step(5)}>
            <Magnetic>
              <Button href="#projects">{copy.primaryCta}</Button>
            </Magnetic>
            <Magnetic>
              <Button href="#contact" variant="secondary">
                {copy.secondaryCta}
              </Button>
            </Magnetic>
          </div>
        </div>
        {photo ? (
          <div className="scene-hide rise mx-auto w-full max-w-sm" style={step(2)}>
            <Portrait src={photo} name={profile.name} chips={chips.map((c) => c.name)} priority />
          </div>
        ) : null}
      </div>
    </section>
  );
}
