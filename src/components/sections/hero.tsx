/**
 * Purpose: hero with name, rotating role line, pitch, CTAs, optional portrait and a GPU-cheap animated background.
 * The staggered load sequence is pure CSS (.rise) so it runs at first paint. The portrait appears automatically when
 * public/images/profile.(jpg|webp|png|avif) exists (or content/profile.ts sets `photo`).
 * Photo treatment (styles in styles/photo.css): spinning gradient border, curtain + zoom reveal on load, gentle float,
 * mouse tilt/spotlight, and two floating chips with the owner's core skills. Transform/opacity only.
 * Inputs: content/profile.ts, content/sections.ts, content/skills.ts, lib/media.ts.
 */
import Image from "next/image";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { TiltCard } from "@/components/motion/tilt-card";
import { Button } from "@/components/ui/button";
import { RotatingRole } from "@/components/ui/rotating-role";
import { real } from "@/lib/content/real";
import { profilePhoto } from "@/lib/media";
import { cn } from "@/lib/utils";
import "@/styles/photo.css";
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
          <div className="rise mx-auto w-full max-w-sm" style={step(2)}>
            <div className="photo-float relative">
              {chips[0] ? (
                <span
                  aria-hidden="true"
                  className="chip-float-a glass absolute -left-4 top-10 z-20 rounded-full px-4 py-2 font-mono text-sm shadow-md"
                >
                  {chips[0].name}
                </span>
              ) : null}
              {chips[1] ? (
                <span
                  aria-hidden="true"
                  className="chip-float-b glass absolute -right-3 bottom-16 z-20 rounded-full px-4 py-2 font-mono text-sm shadow-md"
                >
                  {chips[1].name}
                </span>
              ) : null}
              <TiltCard maxTilt={4} className="rounded-lg">
                <div className="relative overflow-hidden rounded-lg p-[2px] shadow-glow">
                  <span aria-hidden="true" className="photo-spin" />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--r-lg)-2px)] bg-bg-elevated">
                    <Image
                      src={photo}
                      alt={`Portrait of ${profile.name}`}
                      fill
                      priority
                      sizes="(min-width: 1024px) 30vw, 80vw"
                      className="photo-zoom object-cover object-top"
                    />
                    <span aria-hidden="true" className="photo-vignette" />
                    <span aria-hidden="true" className="photo-curtain" />
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
