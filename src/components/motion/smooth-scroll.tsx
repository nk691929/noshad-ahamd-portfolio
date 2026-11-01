"use client";

/**
 * Purpose: Lenis smooth scrolling, lazy-loaded after mount and disabled under reduced motion.
 * In-page #links are routed through Lenis with the target's scroll-margin-top applied (the sticky nav offset).
 * "#main" (the skip link) is left to the browser so keyboard focus still moves. Renders nothing.
 */
import { useEffect } from "react";
import { useReduced } from "@/lib/motion";

export function SmoothScroll() {
  const reduced = useReduced();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let raf = 0;
    let cleanup: (() => void) | undefined;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis();
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      const onClick = (e: MouseEvent) => {
        const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute("href")?.slice(1);
        if (!id || id === "main") return;
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        lenis.scrollTo(el, { offset: -margin });
        history.pushState(null, "", `#${id}`);
      };
      document.addEventListener("click", onClick);

      cleanup = () => {
        document.removeEventListener("click", onClick);
        cancelAnimationFrame(raf);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced]);

  return null;
}
