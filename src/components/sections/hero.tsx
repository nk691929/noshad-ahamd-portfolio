/**
 * Purpose: hero with name, rotating role line, pitch, CTAs and a GPU-cheap animated background.
 * The staggered load sequence is pure CSS (.rise in sections.css) so it runs at first paint without waiting for
 * JavaScript hydration (protects LCP). Blobs have a subtle scroll parallax; CTAs are magnetic.
 * Inputs: content/profile.ts, content/sections.ts.
 */
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { Button } from "@/components/ui/button";
import { RotatingRole } from "@/components/ui/rotating-role";
import { real } from "@/lib/content/real";
import { profile } from "@content/profile";
import { sectionsCopy } from "@content/sections";

const step = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Hero() {
  const [first, ...rest] = profile.name.split(" ");
  const availability = real(profile.availability);
  const copy = sectionsCopy.hero;

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
      <div className="mx-auto w-full max-w-6xl px-6">
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
    </section>
  );
}
