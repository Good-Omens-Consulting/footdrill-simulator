"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDrillStore } from "@/lib/store";
import { SoldierPose, DEFAULT_POSE, DrillState } from "@/lib/types";

// ── Colour palette ──────────────────────────────────────────────────
const SKIN = "#d4a574";
const UNIFORM = "#6b7a3d"; // olive drab
const BELT_COLOR = "#2a1f0e";
const BOOT_COLOR = "#3b2a1a";
const BERET_COLOR = "#2d4a2d"; // dark green
const TROUSER_COLOR = "#5a6a32"; // slightly darker olive

// ── Dimensions (world units ≈ metres) ───────────────────────────────
const HEAD_RADIUS = 0.11;
const TORSO_W = 0.32;
const TORSO_H = 0.42;
const TORSO_D = 0.18;
const UPPER_ARM_LEN = 0.25;
const FOREARM_LEN = 0.22;
const ARM_RADIUS = 0.04;
const UPPER_LEG_LEN = 0.38;
const LOWER_LEG_LEN = 0.36;
const LEG_RADIUS = 0.05;
const BOOT_H = 0.1;
const BOOT_W = 0.1;
const BOOT_D = 0.16;
const BELT_RADIUS = 0.19;
const BELT_HEIGHT = 0.06;
const BERET_RADIUS = 0.12;

// ── Derived offsets ─────────────────────────────────────────────────
const SHOULDER_Y = TORSO_H / 2 - 0.04;
const SHOULDER_X = TORSO_W / 2 + ARM_RADIUS * 0.5;
const HIP_X = 0.1;
const TORSO_CENTER_Y = UPPER_LEG_LEN + LOWER_LEG_LEN + BOOT_H + TORSO_H / 2;

// ── Pose definitions ────────────────────────────────────────────────
function getPoseForState(state: DrillState): SoldierPose {
  switch (state) {
    case "attention":
    case "halt":
    case "eyes_front":
    case "close_order":
      return { ...DEFAULT_POSE };

    case "stand_at_ease":
      return {
        ...DEFAULT_POSE,
        leftArmSwing: 0.2,
        rightArmSwing: 0.2,
        leftArmOut: -0.1,
        rightArmOut: -0.1,
        leftForearmBend: 0.3,
        rightForearmBend: 0.3,
        leftLegSwing: 0,
        rightLegSwing: 0,
      };

    case "stand_easy":
      return {
        ...DEFAULT_POSE,
        bodyLean: 0.04,
        leftArmSwing: 0.25,
        rightArmSwing: 0.25,
        leftArmOut: -0.15,
        rightArmOut: -0.15,
        leftForearmBend: 0.4,
        rightForearmBend: 0.4,
      };

    case "right_dress":
      return {
        ...DEFAULT_POSE,
        headTurn: -Math.PI / 4,
        rightArmOut: -Math.PI / 2,
        rightForearmBend: 0,
      };

    case "salute":
      return {
        ...DEFAULT_POSE,
        rightArmSwing: -0.1,
        rightArmOut: -0.6,
        rightForearmBend: -2.2,
      };

    case "open_order":
      return { ...DEFAULT_POSE };

    case "dismiss":
      return { ...DEFAULT_POSE };

    case "fall_out":
      return {
        ...DEFAULT_POSE,
        bodyLean: 0.06,
        leftArmSwing: 0.3,
        rightArmSwing: -0.15,
        leftForearmBend: 0.5,
        rightForearmBend: 0.3,
      };

    default:
      return { ...DEFAULT_POSE };
  }
}

// ── Helper: lerp a full pose ────────────────────────────────────────
function lerpPose(a: SoldierPose, b: SoldierPose, t: number): SoldierPose {
  const result = {} as SoldierPose;
  for (const key of Object.keys(a) as (keyof SoldierPose)[]) {
    result[key] = a[key] + (b[key] - a[key]) * t;
  }
  return result;
}

// ── Component ───────────────────────────────────────────────────────
interface SoldierProps {
  position: [number, number, number];
  soldierIndex: number;
}

export function Soldier({ position, soldierIndex }: SoldierProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Refs for animated parts
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftUpperLegRef = useRef<THREE.Group>(null);
  const rightUpperLegRef = useRef<THREE.Group>(null);
  const leftLowerLegRef = useRef<THREE.Group>(null);
  const rightLowerLegRef = useRef<THREE.Group>(null);

  // Memoised materials
  const materials = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: SKIN }),
      uniform: new THREE.MeshStandardMaterial({ color: UNIFORM }),
      trousers: new THREE.MeshStandardMaterial({ color: TROUSER_COLOR }),
      belt: new THREE.MeshStandardMaterial({ color: BELT_COLOR }),
      boot: new THREE.MeshStandardMaterial({ color: BOOT_COLOR }),
      beret: new THREE.MeshStandardMaterial({ color: BERET_COLOR }),
    }),
    [],
  );

  // Track current interpolated pose for smooth blending
  const poseRef = useRef<SoldierPose>({ ...DEFAULT_POSE });
  const marchPhaseRef = useRef(soldierIndex * 0.3); // stagger march phase
  const worldPosRef = useRef<[number, number, number]>([...position]);
  const rotationRef = useRef(0);

  // Keep world position in sync with prop changes
  const prevPositionRef = useRef(position);
  if (
    position[0] !== prevPositionRef.current[0] ||
    position[2] !== prevPositionRef.current[2]
  ) {
    worldPosRef.current = [...position];
    prevPositionRef.current = position;
  }

  useFrame((_, delta) => {
    if (!groupRef.current || !bodyRef.current) return;

    const {
      drillState,
      previousState,
      isTransitioning,
      transitionProgress,
      activeCommand,
      speed,
      facingAngle,
      soldierPositions,
    } = useDrillStore.getState();

    const dt = delta * speed;

    // ── Determine target pose ─────────────────────────────────────
    let targetPose: SoldierPose;
    let isMarching = false;
    let isMarkTime = false;
    const currentState = isTransitioning && activeCommand ? activeCommand.id : drillState;

    // Continuous marching animation
    if (currentState === "quick_march" || currentState === "double_march") {
      isMarching = true;
    } else if (currentState === "mark_time") {
      isMarkTime = true;
    }

    if (isMarching || isMarkTime) {
      // Advance march phase (120 paces/min = 2 Hz for quick march, 3 Hz for double)
      const marchSpeed = currentState === "double_march" ? 3 : 2;
      marchPhaseRef.current += dt * marchSpeed * Math.PI * 2;

      const phase = marchPhaseRef.current;
      const armSwing = isMarching ? 0.6 : 0.3;
      const legSwing = isMarching ? 0.5 : 0.15;
      const kneeSwing = isMarching ? 0.2 : 0.5;
      const bob = isMarching ? 0.02 : 0.01;

      targetPose = {
        bodyY: Math.abs(Math.sin(phase)) * bob,
        bodyLean: isMarching ? 0.03 : 0,
        leftArmSwing: Math.sin(phase) * armSwing,
        rightArmSwing: -Math.sin(phase) * armSwing,
        leftArmOut: 0,
        rightArmOut: 0,
        leftForearmBend: Math.max(0, Math.sin(phase) * 0.4),
        rightForearmBend: Math.max(0, -Math.sin(phase) * 0.4),
        leftLegSwing: -Math.sin(phase) * legSwing,
        rightLegSwing: Math.sin(phase) * legSwing,
        leftKneeBend: Math.max(0, Math.sin(phase)) * kneeSwing,
        rightKneeBend: Math.max(0, -Math.sin(phase)) * kneeSwing,
        headTurn: 0,
      };
    } else if (isTransitioning && activeCommand) {
      // Transitioning between static poses or performing a one-shot command
      const fromPose = getPoseForState(previousState);
      const toPose = getPoseForState(activeCommand.id);

      // Smooth ease-in-out
      const t = transitionProgress;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      targetPose = lerpPose(fromPose, toPose, eased);
    } else {
      targetPose = getPoseForState(drillState);
    }

    // ── Smooth interpolation toward target ────────────────────────
    const lerpSpeed = 8;
    const pose = poseRef.current;
    for (const key of Object.keys(pose) as (keyof SoldierPose)[]) {
      pose[key] += (targetPose[key] - pose[key]) * Math.min(1, lerpSpeed * dt);
    }

    // ── Handle turns (rotation) ───────────────────────────────────
    if (isTransitioning && activeCommand) {
      const turnId = activeCommand.id;
      if (turnId === "left_turn" || turnId === "right_turn" || turnId === "about_turn") {
        let turnAngle = 0;
        if (turnId === "left_turn") turnAngle = Math.PI / 2;
        else if (turnId === "right_turn") turnAngle = -Math.PI / 2;
        else if (turnId === "about_turn") turnAngle = Math.PI;

        // Compute the starting rotation from the pre-turn facing angle minus the turn delta
        const startRotation = facingAngle - turnAngle;
        const t = transitionProgress;
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        rotationRef.current = startRotation + turnAngle * eased;
      }
    } else {
      rotationRef.current = facingAngle;
    }

    // ── Handle march movement ─────────────────────────────────────
    if (isMarching && !isTransitioning) {
      const marchRate = currentState === "double_march" ? 1.8 : 0.9; // m/s
      const pos = soldierPositions[soldierIndex];
      if (pos) {
        const dx = -Math.sin(facingAngle) * marchRate * dt;
        const dz = -Math.cos(facingAngle) * marchRate * dt;
        worldPosRef.current[0] = (worldPosRef.current[0] ?? pos.x) + dx;
        worldPosRef.current[2] = (worldPosRef.current[2] ?? pos.z) + dz;
      }
    }

    // ── Apply transforms ──────────────────────────────────────────
    groupRef.current.position.set(
      worldPosRef.current[0],
      0,
      worldPosRef.current[2],
    );
    groupRef.current.rotation.y = rotationRef.current;

    // Body bob
    bodyRef.current.position.y = TORSO_CENTER_Y + pose.bodyY;
    bodyRef.current.rotation.x = pose.bodyLean;

    // Head
    if (headRef.current) {
      headRef.current.rotation.y = pose.headTurn;
    }

    // Left arm
    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.rotation.x = pose.leftArmSwing;
      leftUpperArmRef.current.rotation.z = pose.leftArmOut;
    }
    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.x = -pose.leftForearmBend;
    }

    // Right arm
    if (rightUpperArmRef.current) {
      rightUpperArmRef.current.rotation.x = pose.rightArmSwing;
      rightUpperArmRef.current.rotation.z = pose.rightArmOut;
    }
    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.x = -pose.rightForearmBend;
    }

    // Left leg
    if (leftUpperLegRef.current) {
      leftUpperLegRef.current.rotation.x = pose.leftLegSwing;
    }
    if (leftLowerLegRef.current) {
      leftLowerLegRef.current.rotation.x = -pose.leftKneeBend;
    }

    // Right leg
    if (rightUpperLegRef.current) {
      rightUpperLegRef.current.rotation.x = pose.rightLegSwing;
    }
    if (rightLowerLegRef.current) {
      rightLowerLegRef.current.rotation.x = -pose.rightKneeBend;
    }
  });

  // ── Geometries (memoised) ────────────────────────────────────────
  const geom = useMemo(
    () => ({
      head: new THREE.SphereGeometry(HEAD_RADIUS, 16, 12),
      torso: new THREE.BoxGeometry(TORSO_W, TORSO_H, TORSO_D),
      upperArm: new THREE.CylinderGeometry(ARM_RADIUS, ARM_RADIUS * 0.9, UPPER_ARM_LEN, 8),
      forearm: new THREE.CylinderGeometry(ARM_RADIUS * 0.85, ARM_RADIUS * 0.7, FOREARM_LEN, 8),
      upperLeg: new THREE.CylinderGeometry(LEG_RADIUS, LEG_RADIUS * 0.9, UPPER_LEG_LEN, 8),
      lowerLeg: new THREE.CylinderGeometry(LEG_RADIUS * 0.9, LEG_RADIUS * 0.75, LOWER_LEG_LEN, 8),
      boot: new THREE.BoxGeometry(BOOT_W, BOOT_H, BOOT_D),
      belt: new THREE.CylinderGeometry(BELT_RADIUS, BELT_RADIUS, BELT_HEIGHT, 16),
      beret: new THREE.CylinderGeometry(BERET_RADIUS, BERET_RADIUS * 0.9, 0.05, 16),
      beretTop: new THREE.SphereGeometry(BERET_RADIUS * 0.85, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      hand: new THREE.SphereGeometry(ARM_RADIUS * 0.9, 8, 6),
    }),
    [],
  );

  return (
    <group ref={groupRef} position={position}>
      {/* ── Body (torso center – everything hangs off this) ─── */}
      <group ref={bodyRef} position={[0, TORSO_CENTER_Y, 0]}>
        {/* Torso */}
        <mesh geometry={geom.torso} material={materials.uniform} castShadow />

        {/* Belt */}
        <mesh
          geometry={geom.belt}
          material={materials.belt}
          position={[0, -TORSO_H / 2 + BELT_HEIGHT / 2, 0]}
          castShadow
        />

        {/* Shoulder epaulettes (small boxes) */}
        <mesh position={[-SHOULDER_X + 0.02, SHOULDER_Y, 0]} castShadow>
          <boxGeometry args={[0.08, 0.02, 0.1]} />
          <meshStandardMaterial color="#5a6a30" />
        </mesh>
        <mesh position={[SHOULDER_X - 0.02, SHOULDER_Y, 0]} castShadow>
          <boxGeometry args={[0.08, 0.02, 0.1]} />
          <meshStandardMaterial color="#5a6a30" />
        </mesh>

        {/* ── Head ─────────────────────────────────────────────── */}
        <group position={[0, TORSO_H / 2 + HEAD_RADIUS * 0.9, 0]}>
          <mesh ref={headRef} geometry={geom.head} material={materials.skin} castShadow>
            {/* Beret */}
            <group position={[0, HEAD_RADIUS * 0.7, 0]}>
              <mesh geometry={geom.beret} material={materials.beret} castShadow />
              <mesh
                geometry={geom.beretTop}
                material={materials.beret}
                position={[0, 0.025, 0]}
                castShadow
              />
            </group>
            {/* Eyes - small dark spheres */}
            <mesh position={[-0.035, 0.02, HEAD_RADIUS * 0.9]}>
              <sphereGeometry args={[0.015, 6, 4]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.035, 0.02, HEAD_RADIUS * 0.9]}>
              <sphereGeometry args={[0.015, 6, 4]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </mesh>
          {/* Neck */}
          <mesh position={[0, -HEAD_RADIUS * 0.6, 0]} material={materials.skin}>
            <cylinderGeometry args={[0.04, 0.05, 0.08, 8]} />
          </mesh>
        </group>

        {/* ── Left Arm ─────────────────────────────────────────── */}
        <group ref={leftUpperArmRef} position={[-SHOULDER_X, SHOULDER_Y, 0]}>
          <mesh
            geometry={geom.upperArm}
            material={materials.uniform}
            position={[0, -UPPER_ARM_LEN / 2, 0]}
            castShadow
          />
          {/* Forearm pivot at elbow */}
          <group ref={leftForearmRef} position={[0, -UPPER_ARM_LEN, 0]}>
            <mesh
              geometry={geom.forearm}
              material={materials.skin}
              position={[0, -FOREARM_LEN / 2, 0]}
              castShadow
            />
            {/* Hand */}
            <mesh
              geometry={geom.hand}
              material={materials.skin}
              position={[0, -FOREARM_LEN, 0]}
              castShadow
            />
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
          {/* Forearm pivot at elbow */}
          <group ref={rightForearmRef} position={[0, -UPPER_ARM_LEN, 0]}>
            <mesh
              geometry={geom.forearm}
              material={materials.skin}
              position={[0, -FOREARM_LEN / 2, 0]}
              castShadow
            />
            {/* Hand */}
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
      <group
        ref={leftUpperLegRef}
        position={[-HIP_X, UPPER_LEG_LEN + LOWER_LEG_LEN + BOOT_H, 0]}
      >
        <mesh
          geometry={geom.upperLeg}
          material={materials.trousers}
          position={[0, -UPPER_LEG_LEN / 2, 0]}
          castShadow
        />
        {/* Lower leg pivot at knee */}
        <group ref={leftLowerLegRef} position={[0, -UPPER_LEG_LEN, 0]}>
          <mesh
            geometry={geom.lowerLeg}
            material={materials.trousers}
            position={[0, -LOWER_LEG_LEN / 2, 0]}
            castShadow
          />
          {/* Boot */}
          <mesh
            geometry={geom.boot}
            material={materials.boot}
            position={[0, -LOWER_LEG_LEN - BOOT_H / 2 + 0.02, 0.02]}
            castShadow
          />
        </group>
      </group>

      {/* ── Right Leg ──────────────────────────────────────────── */}
      <group
        ref={rightUpperLegRef}
        position={[HIP_X, UPPER_LEG_LEN + LOWER_LEG_LEN + BOOT_H, 0]}
      >
        <mesh
          geometry={geom.upperLeg}
          material={materials.trousers}
          position={[0, -UPPER_LEG_LEN / 2, 0]}
          castShadow
        />
        {/* Lower leg pivot at knee */}
        <group ref={rightLowerLegRef} position={[0, -UPPER_LEG_LEN, 0]}>
          <mesh
            geometry={geom.lowerLeg}
            material={materials.trousers}
            position={[0, -LOWER_LEG_LEN / 2, 0]}
            castShadow
          />
          {/* Boot */}
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
