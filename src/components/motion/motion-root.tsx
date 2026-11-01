"use client";

/**
 * Purpose: mounts the page-level motion effects: smooth scroll and the custom cursor. The cursor chunk is only
 * downloaded after the browser is idle (keeps the initial bundle and LCP lean). Used by: src/app/layout.tsx.
 */
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

const Cursor = dynamic(() => import("@/components/motion/cursor").then((m) => m.Cursor), {
  ssr: false,
});

export function MotionRoot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true));
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <SmoothScroll />
      {ready ? <Cursor /> : null}
    </>
  );
}
