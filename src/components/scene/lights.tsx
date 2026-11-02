"use client";

/**
 * Purpose: cinematic lighting with no network assets. The reflections on the metal come from a procedural
 * environment built from three soft boxes (emerald strip, cool top light, deep-blue rim); a few direct lights add
 * depth. Used by: scene.tsx.
 */
import { Environment, Lightformer } from "@react-three/drei";
import { BLUE, DEEP_BLUE, EMERALD } from "@/lib/scene/palette";

export function Lights() {
  return (
    <>
      <Environment resolution={128} frames={1}>
        <color attach="background" args={["#05070a"]} />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#dfe9f5"
          position={[0, 5, 2]}
          scale={[8, 3, 1]}
          rotation-x={Math.PI / 2}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color={EMERALD}
          position={[-5, 1.5, -1]}
          scale={[1.2, 6, 1]}
          rotation-y={Math.PI / 2}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color={BLUE}
          position={[5, 1, -3]}
          scale={[1.5, 5, 1]}
          rotation-y={-Math.PI / 2}
        />
        <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[0, 0.5, 6]} scale={3} />
      </Environment>
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} color="#e8f1ff" />
      <pointLight position={[-3.2, 1.6, -2.6]} intensity={28} distance={14} color={EMERALD} />
      <pointLight position={[3.4, 2.2, -3]} intensity={14} distance={14} color={DEEP_BLUE} />
    </>
  );
}
