"use client";

/**
 * Purpose: decides whether the 3D scene runs and loads it lazily. The inline gate script in layout.tsx sets
 * <html data-scene="on"> before first paint only when WebGL works and the visitor allows motion (no reduced motion,
 * no data saver, not a very low-memory device). If the scene then fails (module error, WebGL context lost) the
 * attribute flips to "off" and the original static design takes over, so the site always works.
 * The heavy chunk (three.js + react-three-fiber) is only requested once the browser is idle.
 * Inputs: SceneData from the server. Used by: src/app/page.tsx.
 */
import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import type { SceneData } from "@/lib/scene/types";

const Scene = dynamic(() => import("./scene").then((m) => m.Scene), { ssr: false });

class Boundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch() {
    this.props.onError();
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SceneLoader({ data }: { data: SceneData }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.scene !== "on") return;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setEnabled(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setEnabled(true), 600);
    return () => window.clearTimeout(id);
  }, []);

  const fail = () => {
    document.documentElement.dataset.scene = "off";
    setEnabled(false);
  };

  if (!enabled) return null;
  return (
    <Boundary onError={fail}>
      <Scene data={data} onFail={fail} />
    </Boundary>
  );
}
