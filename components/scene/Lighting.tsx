"use client";

import { useMemo } from "react";
import { useDrillStore } from "@/lib/store";
import type { Environment } from "@/lib/types";

interface LightConfig {
  sunColor: string;
  sunIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  sunPosition: [number, number, number];
}

function getLightConfig(env: Environment): LightConfig {
  switch (env) {
    case "military":
      return {
        sunColor: "#fff5e0",
        sunIntensity: 1.8,
        ambientColor: "#b0c0d0",
        ambientIntensity: 0.6,
        sunPosition: [15, 20, 10],
      };
    case "scout_camp":
      return {
        sunColor: "#fffde0",
        sunIntensity: 2.0,
        ambientColor: "#c0d8c0",
        ambientIntensity: 0.7,
        sunPosition: [12, 18, 8],
      };
    case "plain":
    default:
      return {
        sunColor: "#ffffff",
        sunIntensity: 1.5,
        ambientColor: "#cccccc",
        ambientIntensity: 0.5,
        sunPosition: [10, 20, 10],
      };
  }
}

export function Lighting() {
  const environment = useDrillStore((s) => s.environment);

  const config = useMemo(() => getLightConfig(environment), [environment]);

  return (
    <>
      {/* Ambient fill */}
      <ambientLight
        color={config.ambientColor}
        intensity={config.ambientIntensity}
      />

      {/* Directional sun with shadows */}
      <directionalLight
        color={config.sunColor}
        intensity={config.sunIntensity}
        position={config.sunPosition}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-bias={-0.001}
      />

      {/* Gentle hemisphere light for natural feel */}
      <hemisphereLight
        color="#87ceeb"    // sky blue
        groundColor="#4a3a2a" // warm ground bounce
        intensity={0.3}
      />
    </>
  );
}
