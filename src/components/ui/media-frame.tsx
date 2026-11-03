"use client";

/**
 * Purpose: project preview media (poster image + optional muted looping video).
 * Stability rules (mobile Safari kills tabs that keep several decoded videos alive):
 *  - the <video> is mounted only while the card is near the viewport and REMOVED again when it scrolls away
 *    (removing the element releases its decoder and frame buffers);
 *  - touch devices never autoplay: the poster is shown and the video loads only when the visitor taps play;
 *  - `preload="none"`, so nothing downloads before it is needed; reduced motion never autoplays either.
 * A pause/play button is always present when a video exists. Inputs: title, cover, video, kind. Client only.
 */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFinePointer, useReduced } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = { title: string; cover?: string; video?: string; kind: "browser" | "app" };

export function MediaFrame({ title, cover, video, kind }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReduced();
  const fine = useFinePointer();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [userPlay, setUserPlay] = useState<boolean | null>(null);

  // Desktop with motion allowed: autoplay while visible. Everyone else: only when the visitor asks.
  const wantsPlay = userPlay ?? (fine && !reduced);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || !video) return;
    const nearObserver = new IntersectionObserver(
      ([entry]) => setNear(Boolean(entry?.isIntersecting)),
      {
        rootMargin: "200px",
      },
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

  const mounted = Boolean(video) && near && wantsPlay;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inView && wantsPlay) el.play().catch(() => {});
    else el.pause();
    return () => {
      // release the decoder when the element goes away
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, [mounted, inView, wantsPlay]);

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
        {mounted ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
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
            className="glass absolute bottom-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full text-fg"
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
