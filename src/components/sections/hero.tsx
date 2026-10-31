/**
 * Purpose: hero with name, rotating role line, pitch, CTAs and a GPU-cheap animated background.
 * Inputs: content/profile.ts, content/sections.ts. Staggered load reveal is added in step 5.
 */
import { Button } from "@/components/ui/button";
import { RotatingRole } from "@/components/ui/rotating-role";
import { real } from "@/lib/content/real";
import { profile } from "@content/profile";
import { sectionsCopy } from "@content/sections";

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
        <div className="hero-blob hero-blob--a" />
        <div className="hero-blob hero-blob--b" />
      </div>
      <div className="mx-auto w-full max-w-6xl px-6">
        {availability ? (
          <p className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-fg-muted">
            <span className="h-2 w-2 rounded-full bg-accent-2" aria-hidden="true" />
            {availability}
          </p>
        ) : null}
        <h1 id="hero-title" className="font-display text-hero">
          {first} <span className="text-gradient">{rest.join(" ")}</span>
        </h1>
        <p className="mt-6 font-display text-h3">
          {copy.rolePrefix} <RotatingRole roles={profile.roles} />
        </p>
        <p className="mt-6 max-w-2xl text-lg text-fg-muted">{profile.pitch}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="#projects">{copy.primaryCta}</Button>
          <Button href="#contact" variant="secondary">
            {copy.secondaryCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
