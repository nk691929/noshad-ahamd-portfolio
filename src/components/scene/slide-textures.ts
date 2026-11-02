/**
 * Purpose: textures for the laptop screen. A slide with a screenshot loads it lazily; a slide without one gets a
 * generated title card (canvas). Cards are redrawn once web fonts are ready. Client only.
 * Used by: laptop.tsx. Dispose with dispose() when the scene unmounts.
 */
import * as THREE from "three";
import { EMERALD, INK } from "@/lib/scene/palette";
import type { Slide } from "@/lib/scene/types";

const CARD_W = 1280;
const CARD_H = 720;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function drawCard(canvas: HTMLCanvasElement, slide: Slide, index: number, family: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, INK);
  g.addColorStop(0.55, "#0b1d2c");
  g.addColorStop(1, "#0a3b36");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const glow = ctx.createRadialGradient(
    CARD_W * 0.85,
    CARD_H * 0.1,
    0,
    CARD_W * 0.85,
    CARD_H * 0.1,
    620,
  );
  glow.addColorStop(0, "rgba(16,201,143,0.35)");
  glow.addColorStop(1, "rgba(16,201,143,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= CARD_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CARD_H);
    ctx.stroke();
  }
  for (let y = 0; y <= CARD_H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CARD_W, y);
    ctx.stroke();
  }

  ctx.fillStyle = EMERALD;
  ctx.fillRect(80, 150, 64, 6);

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `500 30px ${family}`;
  ctx.fillText(index === 0 ? "PORTFOLIO" : `PROJECT ${String(index).padStart(2, "0")}`, 80, 120);

  ctx.fillStyle = "#f2f5fa";
  ctx.font = `600 96px ${family}`;
  const lines = wrap(ctx, slide.title, CARD_W - 200);
  lines.forEach((l, i) => ctx.fillText(l, 80, 270 + i * 108));

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `400 34px ${family}`;
  ctx.fillText(slide.subtitle, 80, CARD_H - 90);
}

export class SlideTextures {
  private cache = new Map<number, THREE.Texture>();
  private aspects = new Map<number, number>();
  private disposed = false;

  constructor(
    private slides: Slide[],
    private fontFamily: () => string,
  ) {}

  aspect(index: number): number {
    return this.aspects.get(this.clampIndex(index)) ?? CARD_W / CARD_H;
  }

  get(index: number): THREE.Texture {
    const i = this.clampIndex(index);
    const hit = this.cache.get(i);
    if (hit) return hit;
    const slide = this.slides[i];
    const texture = slide?.cover ? this.loadImage(i, slide.cover) : this.makeCard(i);
    this.cache.set(i, texture);
    return texture;
  }

  /** Called when the scene mounts; also covers React strict mode, which mounts, unmounts and mounts again. */
  revive() {
    this.disposed = false;
  }

  dispose() {
    this.disposed = true;
    this.cache.forEach((t) => t.dispose());
    this.cache.clear();
  }

  private clampIndex(i: number) {
    return Math.max(0, Math.min(this.slides.length - 1, Math.round(i)));
  }

  private finish(t: THREE.Texture) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  private makeCard(i: number): THREE.Texture {
    const slide = this.slides[i] ?? { title: "", subtitle: "" };
    const canvas = document.createElement("canvas");
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    drawCard(canvas, slide, i, this.fontFamily());
    const texture = this.finish(new THREE.CanvasTexture(canvas));
    this.aspects.set(i, CARD_W / CARD_H);
    // Redraw once the real fonts are available.
    document.fonts?.ready.then(() => {
      if (this.disposed) return;
      drawCard(canvas, slide, i, this.fontFamily());
      texture.needsUpdate = true;
    });
    return texture;
  }

  private loadImage(i: number, url: string): THREE.Texture {
    // Placeholder until the screenshot arrives; then a NEW texture replaces it (sizes differ).
    const placeholder = this.makeCard(i);
    new THREE.TextureLoader().load(
      url,
      (loaded) => {
        if (this.disposed) {
          loaded.dispose();
          return;
        }
        this.finish(loaded);
        const image = loaded.image as { width: number; height: number };
        this.aspects.set(i, image.width / image.height);
        const old = this.cache.get(i);
        this.cache.set(i, loaded);
        old?.dispose();
      },
      undefined,
      () => {
        // keep the generated card if the screenshot fails to load
      },
    );
    return placeholder;
  }
}
