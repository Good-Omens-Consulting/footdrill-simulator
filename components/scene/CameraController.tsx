"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useDrillStore } from "@/lib/store";
import type { CameraView } from "@/lib/types";

// ── Camera presets (position + lookAt target) ───────────────────────
interface CameraPreset {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

function getPreset(view: CameraView, squadCenter: THREE.Vector3): CameraPreset {
  switch (view) {
    case "top_down":
      return {
        position: new THREE.Vector3(squadCenter.x, 18, squadCenter.z + 0.01),
        target: squadCenter.clone(),
      };
    case "parade":
      return {
        position: new THREE.Vector3(
          squadCenter.x + 8,
          6,
          squadCenter.z + 10,
        ),
        target: squadCenter.clone().add(new THREE.Vector3(0, 1, 0)),
      };
    case "follow":
      return {
        position: new THREE.Vector3(
          squadCenter.x,
          3,
          squadCenter.z + 6,
        ),
        target: squadCenter.clone().add(new THREE.Vector3(0, 1, 0)),
      };
    case "orbit":
    default:
      return {
        position: new THREE.Vector3(
          squadCenter.x + 6,
          5,
          squadCenter.z + 6,
        ),
        target: squadCenter.clone().add(new THREE.Vector3(0, 1, 0)),
      };
  }
}

/** Compute the centre of the squad from soldier positions */
function getSquadCenter(): THREE.Vector3 {
  const positions = useDrillStore.getState().soldierPositions;
  if (positions.length === 0) return new THREE.Vector3(0, 0, 0);

  let sumX = 0;
  let sumZ = 0;
  for (const p of positions) {
    sumX += p.x;
    sumZ += p.z;
  }
  return new THREE.Vector3(sumX / positions.length, 0, sumZ / positions.length);
}

export function CameraController() {
  const cameraView = useDrillStore((s) => s.cameraView);
  const { camera } = useThree();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitRef = useRef<any>(null);
  const targetPosRef = useRef(new THREE.Vector3(6, 5, 6));
  const targetLookRef = useRef(new THREE.Vector3(0, 1, 0));
  const currentPosRef = useRef(new THREE.Vector3());
  const currentLookRef = useRef(new THREE.Vector3(0, 1, 0));
  const isFirstFrame = useRef(true);

  // When view changes, compute new target
  useEffect(() => {
    const center = getSquadCenter();
    const preset = getPreset(cameraView, center);
    targetPosRef.current.copy(preset.position);
    targetLookRef.current.copy(preset.target);

    // For orbit mode, update OrbitControls target
    if (orbitRef.current && cameraView === "orbit") {
      orbitRef.current.target.copy(preset.target);
    }
  }, [cameraView]);

  useFrame(() => {
    const center = getSquadCenter();

    // For follow mode, track the squad continuously
    if (cameraView === "follow") {
      const facingAngle = useDrillStore.getState().facingAngle;
      const offsetX = Math.sin(facingAngle) * 6;
      const offsetZ = Math.cos(facingAngle) * 6;
      targetPosRef.current.set(
        center.x + offsetX,
        3,
        center.z + offsetZ,
      );
      targetLookRef.current.set(center.x, 1, center.z);
    }

    // For orbit mode, let OrbitControls handle everything
    if (cameraView === "orbit") {
      if (isFirstFrame.current) {
        const preset = getPreset("orbit", center);
        camera.position.copy(preset.position);
        if (orbitRef.current) {
          orbitRef.current.target.copy(preset.target);
        }
        isFirstFrame.current = false;
      }
      return;
    }

    // Smooth lerp to target position
    const lerpFactor = 0.04;

    if (isFirstFrame.current) {
      currentPosRef.current.copy(targetPosRef.current);
      currentLookRef.current.copy(targetLookRef.current);
      camera.position.copy(currentPosRef.current);
      camera.lookAt(currentLookRef.current);
      isFirstFrame.current = false;
      return;
    }

    currentPosRef.current.lerp(targetPosRef.current, lerpFactor);
    currentLookRef.current.lerp(targetLookRef.current, lerpFactor);

    camera.position.copy(currentPosRef.current);
    camera.lookAt(currentLookRef.current);

    // Update orbit controls target to match
    if (orbitRef.current) {
      orbitRef.current.target.copy(currentLookRef.current);
    }
  });

  return (
    <OrbitControls
      ref={orbitRef}
      enabled={cameraView === "orbit"}
      enablePan={true}
      enableZoom={true}
      enableRotate={cameraView === "orbit"}
      maxDistance={40}
      minDistance={3}
      maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
    />
  );
}
