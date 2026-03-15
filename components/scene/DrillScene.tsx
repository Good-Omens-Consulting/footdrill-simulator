"use client";

import { Canvas } from "@react-three/fiber";
import { Squad } from "./Squad";
import { DrillSergeant } from "./DrillSergeant";
import { ParadeGround } from "./ParadeGround";
import { CameraController } from "./CameraController";
import { Lighting } from "./Lighting";
import { useDrillStore } from "@/lib/store";
import type { Environment } from "@/lib/types";

/** Background / fog colours per environment */
function getSceneColors(env: Environment) {
  switch (env) {
    case "military":
      return { bg: "#8aa4c0", fog: "#8aa4c0" };
    case "scout_camp":
      return { bg: "#7ab8e0", fog: "#a0c8a0" };
    case "plain":
    default:
      return { bg: "#b0b0b0", fog: "#b0b0b0" };
  }
}

export default function DrillScene() {
  const environment = useDrillStore((s) => s.environment);
  const colors = getSceneColors(environment);

  return (
    <Canvas
      shadows
      camera={{ fov: 50, near: 0.1, far: 100, position: [6, 5, 6] }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true }}
    >
      {/* Background color */}
      <color attach="background" args={[colors.bg]} />

      {/* Depth fog */}
      <fog attach="fog" args={[colors.fog, 20, 55]} />

      {/* Lighting setup */}
      <Lighting />

      {/* Camera */}
      <CameraController />

      {/* Scene content */}
      <ParadeGround />
      <Squad />
      <DrillSergeant />
    </Canvas>
  );
}
