"use client";

import { useEffect, useRef, useState } from "react";
import { useDrillStore } from "@/lib/store";

/** Human-readable labels for drill states */
const STATE_LABELS: Record<string, string> = {
  attention: "ATTENTION",
  stand_at_ease: "STAND AT EASE",
  stand_easy: "STAND EASY",
  quick_march: "QUICK MARCH",
  halt: "HALT",
  mark_time: "MARK TIME",
  left_turn: "LEFT TURN",
  right_turn: "RIGHT TURN",
  about_turn: "ABOUT TURN",
  right_dress: "RIGHT DRESS",
  eyes_front: "EYES FRONT",
  salute: "SALUTE",
  open_order: "OPEN ORDER",
  close_order: "CLOSE ORDER",
  double_march: "DOUBLE MARCH",
  dismiss: "DISMISS",
  fall_out: "FALL OUT",
};

/** State category colors */
function getStateColor(state: string): string {
  if (["quick_march", "double_march", "mark_time"].includes(state)) {
    return "bg-emerald-400";
  }
  if (["left_turn", "right_turn", "about_turn"].includes(state)) {
    return "bg-blue-400";
  }
  if (["dismiss", "fall_out"].includes(state)) {
    return "bg-red-400";
  }
  if (["salute"].includes(state)) {
    return "bg-amber-400";
  }
  return "bg-white";
}

export default function StatusBar() {
  const drillState = useDrillStore((s) => s.drillState);
  const lastCommandText = useDrillStore((s) => s.lastCommandText);
  const squadCount = useDrillStore((s) => s.squadConfig.count);

  const [visibleCommand, setVisibleCommand] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animate last command text: appear then fade out
  useEffect(() => {
    if (!lastCommandText) return;

    // Clear any pending fade
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);

    setVisibleCommand(lastCommandText);
    setIsAnimating(true);

    // Start fade out after 2.5 seconds
    fadeTimeout.current = setTimeout(() => {
      setIsAnimating(false);
    }, 2500);

    return () => {
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    };
  }, [lastCommandText]);

  const stateLabel = STATE_LABELS[drillState] ?? drillState.toUpperCase();
  const dotColor = getStateColor(drillState);

  return (
    <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none">
      <div
        className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10
          rounded-xl px-4 py-2.5 flex items-center justify-between gap-4"
      >
        {/* Left: Drill state badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`w-[clamp(0.45rem,0.8vw,0.6rem)] h-[clamp(0.45rem,0.8vw,0.6rem)]
              rounded-full ${dotColor} animate-pulse`}
          />
          <span
            className="font-mono font-bold text-white tracking-wide
              text-[clamp(0.65rem,1.2vw,0.9rem)]"
          >
            {stateLabel}
          </span>
        </div>

        {/* Center: Last command shouted */}
        <div className="flex-1 flex justify-center overflow-hidden">
          {visibleCommand && (
            <span
              className={`font-bold text-amber-300 text-center whitespace-nowrap
                text-[clamp(0.85rem,1.8vw,1.4rem)] transition-all duration-500
                ${
                  isAnimating
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                }`}
              style={{
                textShadow: "0 0 20px rgba(251, 191, 36, 0.5)",
              }}
            >
              {visibleCommand}
            </span>
          )}
        </div>

        {/* Right: Squad count */}
        <div className="flex items-center gap-1.5 shrink-0 text-white/70">
          <svg
            className="w-[clamp(0.85rem,1.4vw,1.1rem)] h-[clamp(0.85rem,1.4vw,1.1rem)]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          <span className="font-mono text-[clamp(0.7rem,1.2vw,0.9rem)]">
            {squadCount} soldier{squadCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
