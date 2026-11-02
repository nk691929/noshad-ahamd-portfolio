/**
 * Purpose: the animated portrait (spinning gradient ring, curtain + zoom reveal, float, tilt/spotlight) with optional
 * floating skill chips. Extracted so it can sit in the hero (static design) or in the About section (3D mode).
 * Styles: styles/photo.css. Inputs: src (public path), name, chips, priority. Server component.
 */
import Image from "next/image";
import { TiltCard } from "@/components/motion/tilt-card";
import "@/styles/photo.css";

type Props = { src: string; name: string; chips?: string[]; priority?: boolean };

export function Portrait({ src, name, chips = [], priority = false }: Props) {
  return (
    <div className="photo-float relative">
      {chips[0] ? (
        <span
          aria-hidden="true"
          className="chip-float-a glass absolute -left-4 top-10 z-20 rounded-full px-4 py-2 font-mono text-sm shadow-md"
        >
          {chips[0]}
        </span>
      ) : null}
      {chips[1] ? (
        <span
          aria-hidden="true"
          className="chip-float-b glass absolute -right-3 bottom-16 z-20 rounded-full px-4 py-2 font-mono text-sm shadow-md"
        >
          {chips[1]}
        </span>
      ) : null}
      <TiltCard maxTilt={4} className="rounded-lg">
        <div className="relative overflow-hidden rounded-lg p-[2px] shadow-glow">
          <span aria-hidden="true" className="photo-spin" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--r-lg)-2px)] bg-bg-elevated">
            <Image
              src={src}
              alt={`Portrait of ${name}`}
              fill
              {...(priority ? { priority: true } : {})}
              sizes="(min-width: 1024px) 30vw, 80vw"
              className="photo-zoom object-cover object-top"
            />
            <span aria-hidden="true" className="photo-vignette" />
            <span aria-hidden="true" className="photo-curtain" />
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
