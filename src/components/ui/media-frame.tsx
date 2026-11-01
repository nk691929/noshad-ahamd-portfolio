"use client";

/**
 * Purpose: project preview media. A poster image (next/image) and/or a muted looping video that plays only while
 * visible, loads only when near the viewport, never autoplays under reduced motion, and always has a pause/play
 * button (WCAG 2.2.2). Web projects get a browser-window frame; apps get a plain frame (object-contain).
 * Inputs: title, cover, video (public paths), kind. Used by: project-card.tsx.
 */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReduced } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = { title: string; cover?: string; video?: string; kind: "browser" | "app" };

export function MediaFrame({ title, cover, video, kind }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReduced();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [userPlay, setUserPlay] = useState<boolean | null>(null);

  const wantsPlay = userPlay ?? !reduced;

  useEffect(() => {
    const el = boxRef.current;
    if (!el || !video) return;
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          nearObserver.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    const viewObserver = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      {
        threshold: 0.4,
      },
    );
    nearObserver.observe(el);
    viewObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      viewObserver.disconnect();
    };
  }, [video]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inView && wantsPlay) el.play().catch(() => {});
    else el.pause();
  }, [near, inView, wantsPlay]);

  const fit = kind === "browser" ? "object-cover object-top" : "object-contain";
  const type = video?.endsWith(".mp4") ? "video/mp4" : "video/webm";

  return (
    <div className="border-b border-border">
      {kind === "browser" ? (
        <div
          className="flex h-7 items-center gap-1.5 border-b border-border bg-bg-elevated px-3"
          aria-hidden="true"
        >
          <span className="h-2 w-2 rounded-full bg-border-strong" />
          <span className="h-2 w-2 rounded-full bg-border-strong" />
          <span className="h-2 w-2 rounded-full bg-border-strong" />
        </div>
      ) : null}
      <div
        ref={boxRef}
        className={cn(
          "relative aspect-video w-full overflow-hidden",
          kind === "app" ? "bg-surface" : "bg-bg-elevated",
        )}
      >
        {cover ? (
          <Image
            src={cover}
            alt={`Preview of ${title}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={fit}
          />
        ) : null}
        {video && near ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster={cover}
            aria-hidden="true"
            tabIndex={-1}
            className={cn("absolute inset-0 h-full w-full", fit)}
          >
            <source src={cover ? video : `${video}#t=0.1`} type={type} />
          </video>
        ) : null}
        {video ? (
          <button
            type="button"
            onClick={() => setUserPlay(!wantsPlay)}
            aria-label={wantsPlay ? `Pause ${title} preview` : `Play ${title} preview`}
            className="glass absolute bottom-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-fg"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              {wantsPlay ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M7 4l13 8-13 8z" />}
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
