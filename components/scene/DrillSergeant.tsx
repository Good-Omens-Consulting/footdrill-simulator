"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDrillStore } from "@/lib/store";

// ── Colours ─────────────────────────────────────────────────────────
const SKIN = "#c9956c";
const UNIFORM = "#4a5a2a"; // darker olive for seniority
const TROUSER = "#3d4a22";
const BELT_COLOR = "#1a1208";
const BOOT_COLOR = "#2a1a0e";
const BERET_COLOR = "#8b1a1a"; // crimson
const STICK_COLOR = "#6b4226"; // polished wood

// The drill sergeant is ~10% larger than regular soldiers
const SCALE = 1.1;

// Body proportions (world units, pre-scale)
const HEAD_R = 0.12;
const TORSO_W = 0.34;
const TORSO_H = 0.46;
const TORSO_D = 0.2;
const UPPER_ARM_LEN = 0.27;
const FOREARM_LEN = 0.24;
const ARM_R = 0.045;
const UPPER_LEG_LEN = 0.4;
const LOWER_LEG_LEN = 0.38;
const LEG_R = 0.055;
const BOOT_H = 0.11;
const BOOT_W = 0.11;
const BOOT_D = 0.17;
const SHOULDER_Y = TORSO_H / 2 - 0.04;
const SHOULDER_X = TORSO_W / 2 + ARM_R * 0.5;
const HIP_X = 0.11;
const TORSO_CENTER_Y = UPPER_LEG_LEN + LOWER_LEG_LEN + BOOT_H + TORSO_H / 2;

// Pace stick dimensions
const STICK_LEN = 0.9;
const STICK_R = 0.012;

export function DrillSergeant() {
  const groupRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  // Gesture timer for when commands are issued
  const gestureRef = useRef(0);
  const lastCommandRef = useRef("");

  const materials = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: SKIN }),
      uniform: new THREE.MeshStandardMaterial({ color: UNIFORM }),
      trousers: new THREE.MeshStandardMaterial({ color: TROUSER }),
      belt: new THREE.MeshStandardMaterial({ color: BELT_COLOR }),
      boot: new THREE.MeshStandardMaterial({ color: BOOT_COLOR }),
      beret: new THREE.MeshStandardMaterial({ color: BERET_COLOR }),
      stick: new THREE.MeshStandardMaterial({ color: STICK_COLOR }),
    }),
    [],
  );

  const geom = useMemo(
    () => ({
      head: new THREE.SphereGeometry(HEAD_R, 16, 12),
      torso: new THREE.BoxGeometry(TORSO_W, TORSO_H, TORSO_D),
      upperArm: new THREE.CylinderGeometry(ARM_R, ARM_R * 0.9, UPPER_ARM_LEN, 8),
      forearm: new THREE.CylinderGeometry(ARM_R * 0.85, ARM_R * 0.7, FOREARM_LEN, 8),
      upperLeg: new THREE.CylinderGeometry(LEG_R, LEG_R * 0.9, UPPER_LEG_LEN, 8),
      lowerLeg: new THREE.CylinderGeometry(LEG_R * 0.9, LEG_R * 0.75, LOWER_LEG_LEN, 8),
      boot: new THREE.BoxGeometry(BOOT_W, BOOT_H, BOOT_D),
      belt: new THREE.CylinderGeometry(0.21, 0.21, 0.06, 16),
      beret: new THREE.CylinderGeometry(0.13, 0.12, 0.055, 16),
      beretTop: new THREE.SphereGeometry(0.11, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      hand: new THREE.SphereGeometry(ARM_R * 0.9, 8, 6),
      stick: new THREE.CylinderGeometry(STICK_R, STICK_R, STICK_LEN, 6),
      stickTip: new THREE.ConeGeometry(STICK_R * 2, 0.03, 6),
    }),
    [],
  );

  // Position the sergeant offset to the right-front of the squad, facing it
  const facingAngle = useDrillStore((s) => s.facingAngle);
  const lastCommandText = useDrillStore((s) => s.lastCommandText);

  useFrame((_, delta) => {
    // Detect new command for gesture
    if (lastCommandText !== lastCommandRef.current) {
      lastCommandRef.current = lastCommandText;
      gestureRef.current = 1.2; // start gesture timer
    }

    if (gestureRef.current > 0) {
      gestureRef.current -= delta;

      // Right arm gesture - pointing / emphasising
      if (rightUpperArmRef.current) {
        const t = Math.max(0, gestureRef.current);
        const swing = Math.sin(t * 8) * 0.3 * Math.min(t, 0.5);
        rightUpperArmRef.current.rotation.x = -0.5 - swing;
        rightUpperArmRef.current.rotation.z = 0.3;
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = -0.6;
      }
    } else {
      // Resting pose: pace stick under left arm, right arm at side
      if (rightUpperArmRef.current) {
        rightUpperArmRef.current.rotation.x = 0;
        rightUpperArmRef.current.rotation.z = 0;
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = 0;
      }
    }

    // Left arm always holds pace stick tucked under arm
    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.rotation.x = 0.3;
      leftUpperArmRef.current.rotation.z = 0.15;
    }
    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.x = -0.8;
    }
  });

  // Compute sergeant position: offset right-front of the squad, facing the squad
  const sgtX = -Math.sin(facingAngle + Math.PI / 6) * 5;
  const sgtZ = -Math.cos(facingAngle + Math.PI / 6) * 5;
  const sgtRotation = facingAngle + Math.PI; // face toward the squad

  return (
    <group
      ref={groupRef}
      position={[sgtX, 0, sgtZ]}
      rotation={[0, sgtRotation, 0]}
      scale={[SCALE, SCALE, SCALE]}
    >
      {/* ── Body ────────────────────────────────────────────────── */}
      <group position={[0, TORSO_CENTER_Y, 0]}>
        {/* Torso */}
        <mesh geometry={geom.torso} material={materials.uniform} castShadow />

        {/* Belt */}
        <mesh
          geometry={geom.belt}
          material={materials.belt}
          position={[0, -TORSO_H / 2 + 0.03, 0]}
          castShadow
        />

        {/* Rank insignia - chevrons (simplified as a small bar) */}
        <mesh position={[SHOULDER_X - 0.02, SHOULDER_Y - 0.06, TORSO_D / 2 + 0.005]}>
          <boxGeometry args={[0.06, 0.04, 0.005]} />
          <meshStandardMaterial color="#c9a84c" /> {/* gold */}
        </mesh>

        {/* Shoulder boards */}
        <mesh position={[-SHOULDER_X + 0.02, SHOULDER_Y, 0]} castShadow>
          <boxGeometry args={[0.09, 0.025, 0.11]} />
          <meshStandardMaterial color="#3d4a22" />
        </mesh>
        <mesh position={[SHOULDER_X - 0.02, SHOULDER_Y, 0]} castShadow>
          <boxGeometry args={[0.09, 0.025, 0.11]} />
          <meshStandardMaterial color="#3d4a22" />
        </mesh>

        {/* ── Head ──────────────────────────────────────────────── */}
        <group position={[0, TORSO_H / 2 + HEAD_R * 0.9, 0]}>
          <mesh geometry={geom.head} material={materials.skin} castShadow>
            {/* Crimson beret */}
            <group position={[0, HEAD_R * 0.7, 0]}>
              <mesh geometry={geom.beret} material={materials.beret} castShadow />
              <mesh
                geometry={geom.beretTop}
                material={materials.beret}
                position={[0, 0.028, 0]}
                castShadow
              />
              {/* Badge on beret */}
              <mesh position={[0, 0.01, 0.12]}>
                <boxGeometry args={[0.03, 0.03, 0.005]} />
                <meshStandardMaterial color="#c9a84c" />
              </mesh>
            </group>
            {/* Eyes */}
            <mesh position={[-0.038, 0.02, HEAD_R * 0.9]}>
              <sphereGeometry args={[0.016, 6, 4]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.038, 0.02, HEAD_R * 0.9]}>
              <sphereGeometry args={[0.016, 6, 4]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </mesh>
          {/* Neck */}
          <mesh position={[0, -HEAD_R * 0.6, 0]} material={materials.skin}>
            <cylinderGeometry args={[0.045, 0.055, 0.08, 8]} />
          </mesh>
        </group>

        {/* ── Left Arm (holds pace stick) ──────────────────────── */}
        <group ref={leftUpperArmRef} position={[-SHOULDER_X, SHOULDER_Y, 0]}>
          <mesh
            geometry={geom.upperArm}
            material={materials.uniform}
            position={[0, -UPPER_ARM_LEN / 2, 0]}
            castShadow
          />
          <group ref={leftForearmRef} position={[0, -UPPER_ARM_LEN, 0]}>
            <mesh
              geometry={geom.forearm}
              material={materials.skin}
              position={[0, -FOREARM_LEN / 2, 0]}
              castShadow
            />
            <mesh
              geometry={geom.hand}
              material={materials.skin}
              position={[0, -FOREARM_LEN, 0]}
              castShadow
            />
            {/* Pace stick held in hand, angled under arm */}
            <group position={[0, -FOREARM_LEN * 0.6, 0]} rotation={[0.5, 0, 0.2]}>
              <mesh geometry={geom.stick} material={materials.stick} castShadow />
              <mesh
                geometry={geom.stickTip}
                material={materials.stick}
                position={[0, -STICK_LEN / 2 - 0.015, 0]}
                rotation={[Math.PI, 0, 0]}
              />
              <mesh
                geometry={geom.stickTip}
                material={materials.stick}
                position={[0, STICK_LEN / 2 + 0.015, 0]}
              />
            </group>
          </group>
        </group>

        {/* ── Right Arm ────────────────────────────────────────── */}
        <group ref={rightUpperArmRef} position={[SHOULDER_X, SHOULDER_Y, 0]}>
          <mesh
            geometry={geom.upperArm}
            material={materials.uniform}
            position={[0, -UPPER_ARM_LEN / 2, 0]}
            castShadow
          />
          <group ref={rightForearmRef} position={[0, -UPPER_ARM_LEN, 0]}>
            <mesh
              geometry={geom.forearm}
              material={materials.skin}
              position={[0, -FOREARM_LEN / 2, 0]}
              castShadow
            />
            <mesh
              geometry={geom.hand}
              material={materials.skin}
              position={[0, -FOREARM_LEN, 0]}
              castShadow
            />
          </group>
        </group>
      </group>

      {/* ── Left Leg ───────────────────────────────────────────── */}
      <group position={[-HIP_X, UPPER_LEG_LEN + LOWER_LEG_LEN + BOOT_H, 0]}>
        <mesh
          geometry={geom.upperLeg}
          material={materials.trousers}
          position={[0, -UPPER_LEG_LEN / 2, 0]}
          castShadow
        />
        <group position={[0, -UPPER_LEG_LEN, 0]}>
          <mesh
            geometry={geom.lowerLeg}
            material={materials.trousers}
            position={[0, -LOWER_LEG_LEN / 2, 0]}
            castShadow
          />
          <mesh
            geometry={geom.boot}
            material={materials.boot}
            position={[0, -LOWER_LEG_LEN - BOOT_H / 2 + 0.02, 0.02]}
            castShadow
          />
        </group>
      </group>

      {/* ── Right Leg ──────────────────────────────────────────── */}
      <group position={[HIP_X, UPPER_LEG_LEN + LOWER_LEG_LEN + BOOT_H, 0]}>
        <mesh
          geometry={geom.upperLeg}
          material={materials.trousers}
          position={[0, -UPPER_LEG_LEN / 2, 0]}
          castShadow
        />
        <group position={[0, -UPPER_LEG_LEN, 0]}>
          <mesh
            geometry={geom.lowerLeg}
            material={materials.trousers}
            position={[0, -LOWER_LEG_LEN / 2, 0]}
            castShadow
          />
          <mesh
            geometry={geom.boot}
            material={materials.boot}
            position={[0, -LOWER_LEG_LEN - BOOT_H / 2 + 0.02, 0.02]}
            castShadow
          />
        </group>
      </group>
    </group>
  );
}
