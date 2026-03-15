"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useDrillStore } from "@/lib/store";
import type { Environment } from "@/lib/types";

// ── Ground sizes ────────────────────────────────────────────────────
const GROUND_SIZE = 60;
const PARADE_SQUARE = 20; // white-lined square size

// ── Helpers ─────────────────────────────────────────────────────────

/** Flat box used as a painted line on the ground */
function PaintedLine({
  position,
  width,
  length,
  color = "#ffffff",
}: {
  position: [number, number, number];
  width: number;
  length: number;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/** Simple building block */
function Building({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Roof - slightly wider */}
      <mesh position={[0, size[1] + 0.15, 0]} castShadow>
        <boxGeometry args={[size[0] + 0.4, 0.3, size[2] + 0.4]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Windows - dark rectangles on the front face */}
      {Array.from({ length: Math.floor(size[0] / 2) }).map((_, i) => (
        <mesh
          key={i}
          position={[
            -size[0] / 2 + 1 + i * 2,
            size[1] * 0.5,
            size[2] / 2 + 0.01,
          ]}
        >
          <planeGeometry args={[0.8, 1]} />
          <meshStandardMaterial color="#1a2a3a" />
        </mesh>
      ))}
    </group>
  );
}

/** Conifer tree (cone on a cylinder trunk) */
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1.2, 6]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>
      {/* Canopy layers */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.8, 1.4, 8]} />
        <meshStandardMaterial color="#2d5a1e" />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial color="#3a6a28" />
      </mesh>
      <mesh position={[0, 3.0, 0]} castShadow>
        <coneGeometry args={[0.35, 0.8, 8]} />
        <meshStandardMaterial color="#4a7a32" />
      </mesh>
    </group>
  );
}

/** Flagpole with flag */
function Flagpole({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 6, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Top ball */}
      <mesh position={[0, 6, 0]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Flag */}
      <mesh position={[0.4, 5.3, 0]} castShadow>
        <planeGeometry args={[0.8, 0.5]} />
        <meshStandardMaterial color="#cc2222" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Environment renderers ───────────────────────────────────────────

function MilitaryEnvironment() {
  return (
    <>
      {/* Parade square white border lines */}
      <PaintedLine
        position={[0, 0.005, -PARADE_SQUARE / 2]}
        width={PARADE_SQUARE}
        length={0.1}
      />
      <PaintedLine
        position={[0, 0.005, PARADE_SQUARE / 2]}
        width={PARADE_SQUARE}
        length={0.1}
      />
      <PaintedLine
        position={[-PARADE_SQUARE / 2, 0.005, 0]}
        width={0.1}
        length={PARADE_SQUARE}
      />
      <PaintedLine
        position={[PARADE_SQUARE / 2, 0.005, 0]}
        width={0.1}
        length={PARADE_SQUARE}
      />
      {/* Centre cross */}
      <PaintedLine position={[0, 0.005, 0]} width={2} length={0.05} />
      <PaintedLine position={[0, 0.005, 0]} width={0.05} length={2} />

      {/* Buildings around the perimeter */}
      <Building
        position={[-20, 0, -20]}
        size={[10, 4, 6]}
        color="#7a7a6a"
      />
      <Building
        position={[18, 0, -22]}
        size={[8, 5, 5]}
        color="#6a7a7a"
      />
      <Building
        position={[-22, 0, 18]}
        size={[12, 3.5, 7]}
        color="#7a6a6a"
      />

      {/* Flagpole */}
      <Flagpole position={[PARADE_SQUARE / 2 + 2, 0, -PARADE_SQUARE / 2 - 2]} />
    </>
  );
}

function ScoutCampEnvironment() {
  const treePositions: [number, number, number][] = useMemo(
    () => [
      [-15, 0, -12],
      [-18, 0, -5],
      [-16, 0, 8],
      [-20, 0, 15],
      [14, 0, -14],
      [18, 0, -8],
      [16, 0, 5],
      [20, 0, 12],
      [22, 0, 18],
      [-12, 0, -18],
      [10, 0, -20],
      [-22, 0, -15],
      [25, 0, -2],
      [-25, 0, 3],
    ],
    [],
  );

  return (
    <>
      {/* Trees around the clearing */}
      {treePositions.map((pos, i) => (
        <Tree key={i} position={pos} />
      ))}

      {/* Flagpole */}
      <Flagpole position={[8, 0, -8]} />

      {/* Campfire circle (ring of stones) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`stone-${i}`}
            position={[
              -8 + Math.cos(angle) * 1.2,
              0.1,
              8 + Math.sin(angle) * 1.2,
            ]}
            castShadow
          >
            <sphereGeometry args={[0.15, 6, 4]} />
            <meshStandardMaterial color="#666666" roughness={0.9} />
          </mesh>
        );
      })}
    </>
  );
}

// ── Main component ──────────────────────────────────────────────────

export function ParadeGround() {
  const environment = useDrillStore((s) => s.environment);

  const groundColor = useMemo(() => {
    const colors: Record<Environment, string> = {
      military: "#3a3a3a",   // dark asphalt
      scout_camp: "#4a7a3a", // green grass
      plain: "#555555",      // neutral grey
    };
    return colors[environment];
  }, [environment]);

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color={groundColor} roughness={0.9} />
      </mesh>

      {/* Environment-specific decoration */}
      {environment === "military" && <MilitaryEnvironment />}
      {environment === "scout_camp" && <ScoutCampEnvironment />}
      {/* "plain" gets no decoration */}
    </group>
  );
}
