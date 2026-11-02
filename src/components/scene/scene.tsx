"use client";

/**
 * Purpose: the single, continuous 3D scene. One fixed full-screen WebGL canvas BEHIND the page content (never
 * intercepts pointer events, never scrolls the page). Contains the laptop, the technology constellation and the
 * emerald finale, all driven by one scroll timeline (see rig.tsx / timeline.ts).
 * Performance: pixel ratio capped (1.75 desktop / 1.25 phones, drops to 1 if frame rate falls), no shadows or
 * post-processing, procedural environment, render loop paused while the canvas is hidden behind dense sections.
 * Loaded lazily (scene-loader.tsx). Used by: scene-loader.tsx.
 */
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import { computePivots } from "@/lib/scene/pivots";
import { STAGES, createParams, sampleStages, stageT } from "@/lib/scene/timeline";
import type { SceneData } from "@/lib/scene/types";
import { Finale } from "./finale";
import { Laptop } from "./laptop";
import { Lights } from "./lights";
import { FOV, Rig } from "./rig";
import { SlideTextures } from "./slide-textures";
import { TechConstellation } from "./tech-constellation";

const fontFamily = () => getComputedStyle(document.querySelector("h1") ?? document.body).fontFamily;

type Props = { data: SceneData; onFail: () => void };

export function Scene({ data, onFail }: Props) {
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [dprMax, setDprMax] = useState(mobile ? 1.25 : 1.75);
  const [active, setActive] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  const [params] = useState(createParams);
  const setOpacity = useCallback((value: number) => {
    if (wrap.current) wrap.current.style.opacity = String(value);
  }, []);
  const pivots = useRef<number[]>([]);
  const [textures] = useState(() => new SlideTextures(data.slides, fontFamily));

  const projectCount = data.slides.length - 1;
  const tech = data.tech.slice(0, mobile ? 8 : 12);

  useEffect(() => {
    textures.revive();
    return () => textures.dispose();
  }, [textures]);

  // Measure section positions; keep them fresh when layout, fonts or images change.
  useEffect(() => {
    const recompute = () => {
      const p = computePivots();
      if (p) pivots.current = p;
    };
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(recompute, 120);
    };
    const onScroll = () => {
      const t = stageT(window.scrollY, pivots.current);
      const visible = sampleStages(STAGES, t).opacity > 0.01;
      setActive((prev) => (prev === visible ? prev : visible));
    };

    recompute();
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    document.fonts?.ready.then(schedule);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [pivots]);

  useEffect(() => {
    if (!active && wrap.current) wrap.current.style.opacity = "0";
  }, [active]);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[-1] opacity-0"
      style={{ height: "100lvh" }}
    >
      <Canvas
        dpr={[1, dprMax]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: FOV, near: 0.1, far: 60, position: [0, 0, 8] }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            onFail();
          });
        }}
      >
        <PerformanceMonitor onDecline={() => setDprMax(1)} />
        <Rig
          params={params}
          pivots={pivots}
          projectCount={projectCount}
          lastSlide={data.slides.length - 1}
          onOpacity={setOpacity}
        />
        <Lights />
        <Laptop params={params} textures={textures} />
        <TechConstellation params={params} nodes={tech} fontFamily={fontFamily} />
        <Finale params={params} count={mobile ? 70 : 140} />
      </Canvas>
    </div>
  );
}
