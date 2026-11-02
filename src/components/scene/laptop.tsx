"use client";

/**
 * Purpose: the hero device. A procedural laptop (aluminium body, backlit keys, hinge, bezel, glass) whose screen
 * crossfades between the portfolio and the real project screenshots as the visitor scrolls. The lid opens on load.
 * Everything is driven by SceneParams (written by the Rig); nothing here reads the DOM.
 * Used by: scene.tsx.
 */
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { EMERALD, METAL } from "@/lib/scene/palette";
import { clamp, easeOutCubic, lerp, type SceneParams } from "@/lib/scene/timeline";
import type { SlideTextures } from "./slide-textures";

const BASE_W = 3.1;
const BASE_D = 2.1;
const BASE_H = 0.13;
const LID_H = 1.9;
const SCREEN_W = 2.86;
const SCREEN_H = 1.61;
const SCREEN_ASPECT = SCREEN_W / SCREEN_H;
const LID_CLOSED = Math.PI / 2 - 0.02;
const LID_OPEN = -0.3;
const KEY_ROWS = 5;
const KEY_COLS = 13;

function Keys() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    let n = 0;
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        m.makeTranslation((c - (KEY_COLS - 1) / 2) * 0.205, 0.08, -0.62 + r * 0.205);
        mesh.setMatrixAt(n++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, KEY_ROWS * KEY_COLS]}>
      <boxGeometry args={[0.18, 0.03, 0.18]} />
      <meshStandardMaterial color="#15181d" metalness={0.5} roughness={0.55} />
    </instancedMesh>
  );
}

/** Fit a texture into the screen: crop to cover for landscape, centre for portrait. Zoom is applied inside the crop. */
function fit(mesh: THREE.Mesh, texture: THREE.Texture, aspect: number, zoom: number) {
  if (aspect >= 1.2) {
    const r = SCREEN_ASPECT / aspect;
    const rx = r < 1 ? r : 1;
    const ry = r < 1 ? 1 : 1 / r;
    texture.repeat.set(rx / zoom, ry / zoom);
    texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
    mesh.scale.set(1, 1, 1);
  } else {
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
    mesh.scale.set(Math.min(1, aspect / SCREEN_ASPECT), 1, 1);
  }
}

function Screen({ params, textures }: { params: SceneParams; textures: SlideTextures }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const matA = useRef<THREE.MeshBasicMaterial>(null);
  const matB = useRef<THREE.MeshBasicMaterial>(null);
  // An initial map keeps the shader compiled with texture support, so later swaps need no recompile.
  const first = useMemo(() => textures.get(0), [textures]);

  useFrame(() => {
    const meshA = a.current;
    const meshB = b.current;
    const mA = matA.current;
    const mB = matB.current;
    if (!meshA || !meshB || !mA || !mB) return;

    const texA = textures.get(params.from);
    const texB = textures.get(params.to);
    const mix = params.mix;
    const dim = (1 - 0.4 * Math.sin(Math.PI * mix)) * (1 - params.finale * 0.85);

    mA.map = texA;
    fit(meshA, texA, textures.aspect(params.from), 1 + 0.06 * mix);
    mA.color.setScalar(dim);

    const showB = mix > 0.002 && params.to !== params.from;
    meshB.visible = showB;
    if (showB) {
      mB.map = texB;
      fit(meshB, texB, textures.aspect(params.to), 1.06 - 0.06 * mix);
      mB.opacity = mix;
      mB.color.setScalar(dim);
    }
  });

  return (
    <group position={[0, LID_H / 2, 0.0362]}>
      <mesh ref={a}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial ref={matA} map={first} toneMapped={false} />
      </mesh>
      <mesh ref={b} position={[0, 0, 0.0004]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial ref={matB} map={first} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Laptop({ params, textures }: { params: SceneParams; textures: SlideTextures }) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const keyGlow = useMemo(() => new THREE.Color(EMERALD), []);

  useFrame((state) => {
    const g = group.current;
    const l = lid.current;
    if (!g || !l) return;
    const t = state.clock.elapsedTime;
    const scale = params.scale;
    g.visible = scale > 0.015;
    g.scale.setScalar(Math.max(scale, 0.0001));
    g.position.y = Math.sin(t * 0.8) * 0.04;
    g.rotation.y = params.yaw + Math.sin(t * 0.35) * 0.035;
    g.rotation.x = Math.sin(t * 0.5) * 0.01;
    const open = clamp(params.open, 0, 1) * easeOutCubic(params.intro);
    l.rotation.x = lerp(LID_CLOSED, LID_OPEN, open);
  });

  return (
    <group ref={group}>
      {/* aluminium body */}
      <RoundedBox args={[BASE_W, BASE_H, BASE_D]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={METAL} metalness={1} roughness={0.32} envMapIntensity={1.15} />
      </RoundedBox>
      {/* keyboard well with a faint emerald backlight showing between the keys */}
      <mesh position={[0, BASE_H / 2 + 0.001, -0.1]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.78, 1.2]} />
        <meshStandardMaterial color="#0b0d10" roughness={0.85} metalness={0.2} />
      </mesh>
      <mesh position={[0, BASE_H / 2 + 0.0025, -0.1]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.7, 1.12]} />
        <meshBasicMaterial color={keyGlow} transparent opacity={0.16} toneMapped={false} />
      </mesh>
      <group position={[0, BASE_H / 2 - 0.02, 0]}>
        <Keys />
      </group>
      <RoundedBox
        args={[0.96, 0.004, 0.62]}
        radius={0.002}
        position={[0, BASE_H / 2 + 0.002, 0.72]}
      >
        <meshStandardMaterial color="#9ea4ad" metalness={1} roughness={0.28} />
      </RoundedBox>
      {/* hinge */}
      <mesh position={[0, BASE_H / 2 + 0.005, -BASE_D / 2 + 0.03]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.04, 0.04, 2.6, 24]} />
        <meshStandardMaterial color="#2a2d33" metalness={1} roughness={0.35} />
      </mesh>
      {/* lid, pivoting at the back edge */}
      <group ref={lid} position={[0, BASE_H / 2 + 0.03, -BASE_D / 2 + 0.03]}>
        <RoundedBox
          args={[BASE_W, LID_H, 0.07]}
          radius={0.04}
          smoothness={4}
          position={[0, LID_H / 2, 0]}
        >
          <meshStandardMaterial
            color={METAL}
            metalness={1}
            roughness={0.3}
            envMapIntensity={1.15}
          />
        </RoundedBox>
        {/* bezel */}
        <mesh position={[0, LID_H / 2, 0.0356]}>
          <planeGeometry args={[3.0, 1.78]} />
          <meshStandardMaterial color="#050607" roughness={0.4} metalness={0.2} />
        </mesh>
        <Screen params={params} textures={textures} />
        {/* glass sheen over the display */}
        <mesh position={[0, LID_H / 2, 0.0378]}>
          <planeGeometry args={[SCREEN_W, SCREEN_H]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.05}
            roughness={0.05}
            metalness={0}
          />
        </mesh>
        {/* webcam */}
        <mesh position={[0, LID_H - 0.07, 0.0359]}>
          <circleGeometry args={[0.018, 20]} />
          <meshBasicMaterial color="#1b2026" />
        </mesh>
        {/* emerald ring on the back of the lid, seen when the camera swings round */}
        <mesh position={[0, LID_H / 2, -0.0356]} rotation-y={Math.PI}>
          <ringGeometry args={[0.11, 0.125, 64]} />
          <meshBasicMaterial color={EMERALD} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
