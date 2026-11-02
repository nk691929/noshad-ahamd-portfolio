"use client";

/**
 * Purpose: depth dust that is always faintly present, and the finale: as `params.finale` rises the particles spiral in
 * and the whole scene converges into one soft emerald focal point (glowing sprite + a thin ring). Fully reversible.
 * Inputs: SceneParams, particle count (lower on phones). Used by: scene.tsx.
 */
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { EMERALD, EMERALD_SOFT } from "@/lib/scene/palette";
import { lerp, smoothstep, type SceneParams } from "@/lib/scene/timeline";
import { createGlowTexture } from "./glow-texture";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Finale({ params, count }: { params: SceneParams; count: number }) {
  const glow = useMemo(() => createGlowTexture(), []);
  const pointsMat = useRef<THREE.PointsMaterial>(null);
  const orb = useRef<THREE.Sprite>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);

  const seeds = useMemo(() => {
    const rnd = mulberry32(7);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + rnd() * 5;
      const theta = rnd() * Math.PI * 2;
      const phi = Math.acos(2 * rnd() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.7;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const geo = useRef<THREE.BufferGeometry>(null);

  useEffect(
    () => () => {
      glow.dispose();
    },
    [glow],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const k = smoothstep(0, 1, params.finale);
    const pull = k * k;
    const attr = geo.current?.getAttribute("position");
    if (attr) {
      const arr = attr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const sx = seeds[i * 3] ?? 0;
        const sy = seeds[i * 3 + 1] ?? 0;
        const sz = seeds[i * 3 + 2] ?? 0;
        const angle = t * 0.03 * (1 + (i % 3)) + k * 2.4;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const x = sx * c - sz * s;
        const z = sx * s + sz * c;
        const y = sy + Math.sin(t * 0.4 + i) * 0.05;
        arr[i * 3] = lerp(x, 0, pull);
        arr[i * 3 + 1] = lerp(y, 0, pull);
        arr[i * 3 + 2] = lerp(z, 0, pull);
      }
      attr.needsUpdate = true;
    }
    if (pointsMat.current) {
      pointsMat.current.opacity = 0.28 + 0.6 * k;
      pointsMat.current.size = 0.07 + 0.05 * k;
    }
    if (orb.current) {
      orb.current.scale.setScalar(0.001 + k * 2.8 + Math.sin(t * 1.6) * 0.06 * k);
      orb.current.material.opacity = k * 0.95;
    }
    if (ring.current && ringMat.current) {
      ring.current.visible = k > 0.05;
      ring.current.scale.setScalar(0.6 + k * 1.5);
      ring.current.rotation.z = t * 0.25;
      ringMat.current.opacity = k * 0.5;
    }
  });

  return (
    <>
      <points frustumCulled={false}>
        <bufferGeometry ref={geo}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMat}
          map={glow}
          color={EMERALD_SOFT}
          size={0.07}
          sizeAttenuation
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <sprite ref={orb}>
        <spriteMaterial
          map={glow}
          color={EMERALD}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <mesh ref={ring} rotation-x={1.1} visible={false}>
        <torusGeometry args={[1, 0.006, 8, 96]} />
        <meshBasicMaterial
          ref={ringMat}
          color={EMERALD_SOFT}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
