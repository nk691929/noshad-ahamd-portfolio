"use client";

/**
 * Purpose: the technology visualisation. Glass name plaques orbit the laptop on three tilted rings and are linked to
 * the core and to their ring neighbours by thin lines. Plaques spread out from the core as `params.tech` rises and
 * collapse back into it on the way out, so scrolling reverses the effect. Labels are drawn on canvases (no fonts or
 * images downloaded). Used by: scene.tsx.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { EMERALD, GROUP_TINT } from "@/lib/scene/palette";
import { at, easeOutCubic, type SceneParams } from "@/lib/scene/timeline";
import type { TechNode } from "@/lib/scene/types";
import { createGlowTexture } from "./glow-texture";

const RINGS = [
  { radius: 2.0, tilt: 0.25, speed: 0.1 },
  { radius: 3.1, tilt: -0.35, speed: -0.07 },
  { radius: 4.2, tilt: 0.15, speed: 0.05 },
] as const;

const LABEL_W = 512;
const LABEL_H = 144;
const PLAQUE_W = 1.15;
const PLAQUE_H = (PLAQUE_W * LABEL_H) / LABEL_W;

function drawLabel(canvas: HTMLCanvasElement, name: string, tint: string, family: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, LABEL_W, LABEL_H);
  const r = LABEL_H / 2 - 6;
  ctx.beginPath();
  ctx.roundRect(6, 6, LABEL_W - 12, LABEL_H - 12, r);
  ctx.fillStyle = "rgba(8,12,18,0.84)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = tint;
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(52, LABEL_H / 2, 11, 0, Math.PI * 2);
  ctx.fillStyle = tint;
  ctx.fill();
  ctx.fillStyle = "#f2f5fa";
  ctx.font = `600 54px ${family}`;
  ctx.textBaseline = "middle";
  let size = 54;
  while (ctx.measureText(name).width > LABEL_W - 140 && size > 28) {
    size -= 2;
    ctx.font = `600 ${size}px ${family}`;
  }
  ctx.fillText(name, 84, LABEL_H / 2 + 2);
}

type Props = { params: SceneParams; nodes: TechNode[]; fontFamily: () => string };

export function TechConstellation({ params, nodes, fontFamily }: Props) {
  const camera = useThree((s) => s.camera);
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const ringMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const ringObjs = useRef<(THREE.LineLoop | null)[]>([]);
  const halo = useRef<THREE.Sprite>(null);

  const layout = useMemo(
    () => nodes.map((_, i) => ({ ring: i % RINGS.length, slot: Math.floor(i / RINGS.length) })),
    [nodes],
  );
  const counts = useMemo(
    () => RINGS.map((_, r) => layout.filter((l) => l.ring === r).length),
    [layout],
  );
  const eulers = useMemo(() => RINGS.map((r) => new THREE.Euler(r.tilt, 0, r.tilt * 0.4)), []);
  const glow = useMemo(() => createGlowTexture(), []);

  const links = useMemo(() => {
    const out: [number, number][] = [];
    for (let r = 0; r < RINGS.length; r++) {
      const idx = layout.map((l, i) => (l.ring === r ? i : -1)).filter((i) => i >= 0);
      if (idx.length > 1) idx.forEach((n, k) => out.push([n, at(idx, (k + 1) % idx.length)]));
    }
    return out;
  }, [layout]);

  const linePositions = useMemo(
    () => new Float32Array((nodes.length + links.length) * 6),
    [nodes.length, links.length],
  );
  const lineGeo = useRef<THREE.BufferGeometry>(null);

  const ringGeometries = useMemo(
    () =>
      RINGS.map((ring) => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < 128; i++) {
          const a = (i / 128) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * ring.radius, 0, Math.sin(a) * ring.radius));
        }
        return new THREE.BufferGeometry().setFromPoints(pts);
      }),
    [],
  );

  const labels = useMemo(
    () =>
      nodes.map((n) => {
        const canvas = document.createElement("canvas");
        canvas.width = LABEL_W;
        canvas.height = LABEL_H;
        drawLabel(canvas, n.name, GROUP_TINT[n.group] ?? "#9aa4b2", fontFamily());
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        return { canvas, texture };
      }),
    [nodes, fontFamily],
  );

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (cancelled) return;
      labels.forEach((l, i) => {
        drawLabel(
          l.canvas,
          at(nodes, i).name,
          GROUP_TINT[at(nodes, i).group] ?? "#9aa4b2",
          fontFamily(),
        );
        l.texture.needsUpdate = true;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [labels, nodes, fontFamily]);

  useEffect(() => {
    return () => {
      labels.forEach((l) => l.texture.dispose());
      glow.dispose();
      ringGeometries.forEach((g) => g.dispose());
    };
  }, [labels, glow, ringGeometries]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const positions = useMemo(() => nodes.map(() => new THREE.Vector3()), [nodes]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const op = params.tech;
    g.visible = op > 0.01;
    if (!g.visible) return;

    const time = state.clock.elapsedTime;
    const spread = easeOutCubic(op);

    nodes.forEach((_, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const l = at(layout, i);
      const ring = at(RINGS, l.ring);
      const count = Math.max(at(counts, l.ring), 1);
      const a =
        (l.slot / count) * Math.PI * 2 + l.ring * 0.9 + time * ring.speed + params.yaw * 0.4;
      tmp
        .set(Math.cos(a) * ring.radius, 0, Math.sin(a) * ring.radius)
        .applyEuler(at(eulers, l.ring))
        .multiplyScalar(spread);
      at(positions, i).copy(tmp);
      mesh.position.copy(tmp);
      mesh.quaternion.copy(camera.quaternion);
      (mesh.material as THREE.MeshBasicMaterial).opacity = op;
    });

    const attr = lineGeo.current?.getAttribute("position");
    if (attr) {
      const arr = attr.array as Float32Array;
      let o = 0;
      for (let i = 0; i < nodes.length; i++) {
        const p = at(positions, i);
        arr[o++] = 0;
        arr[o++] = 0;
        arr[o++] = 0;
        arr[o++] = p.x;
        arr[o++] = p.y;
        arr[o++] = p.z;
      }
      for (const [a, b] of links) {
        const pa = at(positions, a);
        const pb = at(positions, b);
        arr[o++] = pa.x;
        arr[o++] = pa.y;
        arr[o++] = pa.z;
        arr[o++] = pb.x;
        arr[o++] = pb.y;
        arr[o++] = pb.z;
      }
      attr.needsUpdate = true;
    }
    if (lineMat.current) lineMat.current.opacity = op * 0.32;
    ringMats.current.forEach((m) => {
      if (m) m.opacity = op * 0.16;
    });
    ringObjs.current.forEach((o) => o?.scale.setScalar(Math.max(spread, 0.001)));
    if (halo.current) {
      halo.current.scale.setScalar(5.2 * spread);
      halo.current.material.opacity = op * 0.4;
    }
  });

  return (
    <group ref={group} visible={false}>
      <sprite ref={halo}>
        <spriteMaterial
          map={glow}
          color={EMERALD}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      {ringGeometries.map((geo, r) => (
        <lineLoop
          key={r}
          ref={(el) => {
            ringObjs.current[r] = el;
          }}
          geometry={geo}
          rotation={at(eulers, r)}
        >
          <lineBasicMaterial
            ref={(el) => {
              ringMats.current[r] = el;
            }}
            color="#9fb4c7"
            transparent
            depthWrite={false}
          />
        </lineLoop>
      ))}
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={lineGeo}>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMat} color={EMERALD} transparent depthWrite={false} />
      </lineSegments>
      {nodes.map((n, i) => (
        <mesh
          key={n.name}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          renderOrder={2}
        >
          <planeGeometry args={[PLAQUE_W, PLAQUE_H]} />
          <meshBasicMaterial
            map={at(labels, i).texture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
