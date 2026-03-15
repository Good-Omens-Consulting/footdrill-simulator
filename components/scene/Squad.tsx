"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useDrillStore } from "@/lib/store";
import { Soldier } from "./Soldier";

/**
 * Renders the full squad of soldiers based on store positions.
 * Handles transition completion timing and formation-level logic.
 */
export function Squad() {
  const soldierPositions = useDrillStore((s) => s.soldierPositions);
  const isTransitioning = useDrillStore((s) => s.isTransitioning);
  const activeCommand = useDrillStore((s) => s.activeCommand);
  const speed = useDrillStore((s) => s.speed);

  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (!isTransitioning || !activeCommand) {
      elapsedRef.current = 0;
      return;
    }

    const dt = delta * speed;
    elapsedRef.current += dt;

    // Determine transition duration based on command type
    let duration = 0.8; // default static transition
    const cmd = activeCommand.id;

    if (cmd === "left_turn" || cmd === "right_turn") {
      duration = 0.6;
    } else if (cmd === "about_turn") {
      duration = 1.0;
    } else if (cmd === "salute") {
      duration = 1.6; // hold the salute briefly
    } else if (cmd === "dismiss") {
      duration = 1.2;
    } else if (cmd === "quick_march" || cmd === "double_march" || cmd === "mark_time") {
      // Marching commands transition quickly then stay in march state
      duration = 0.5;
    } else if (cmd === "open_order" || cmd === "close_order") {
      duration = 1.0;
    }

    const progress = Math.min(elapsedRef.current / duration, 1);
    useDrillStore.getState().setTransitionProgress(progress);

    if (progress >= 1) {
      useDrillStore.getState().completeTransition();
      elapsedRef.current = 0;
    }
  });

  return (
    <group>
      {soldierPositions.map((pos, index) => (
        <Soldier
          key={index}
          position={[pos.x, 0, pos.z]}
          soldierIndex={index}
        />
      ))}
    </group>
  );
}
