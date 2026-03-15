"use client";

import { useEffect, useCallback } from "react";
import { useDrillStore } from "@/lib/store";
import type { CameraView } from "@/lib/types";

interface CameraOption {
  view: CameraView;
  key: string;
  icon: string;
  label: string;
}

const CAMERA_OPTIONS: CameraOption[] = [
  { view: "orbit", key: "1", icon: "\uD83D\uDD04", label: "Orbit" },
  { view: "top_down", key: "2", icon: "\u2B07\uFE0F", label: "Top" },
  { view: "parade", key: "3", icon: "\uD83C\uDFAC", label: "Parade" },
  { view: "follow", key: "4", icon: "\uD83D\uDC41\uFE0F", label: "Follow" },
];

export default function CameraToggle() {
  const cameraView = useDrillStore((s) => s.cameraView);
  const setCameraView = useDrillStore((s) => s.setCameraView);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const option = CAMERA_OPTIONS.find((o) => o.key === e.key);
      if (option) {
        setCameraView(option.view);
      }
    },
    [setCameraView]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none">
      <div
        className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10
          rounded-xl p-1.5 flex flex-col gap-1"
      >
        {CAMERA_OPTIONS.map((option) => {
          const isActive = cameraView === option.view;
          return (
            <button
              key={option.view}
              onClick={() => setCameraView(option.view)}
              title={`${option.label} (${option.key})`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                transition-all duration-200 text-[clamp(0.65rem,1.1vw,0.8rem)]
                ${
                  isActive
                    ? "bg-white/20 text-white shadow-inner"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
            >
              <span className="text-[clamp(0.8rem,1.3vw,1rem)]">{option.icon}</span>
              <span className="font-medium hidden sm:inline">{option.label}</span>
              <kbd
                className={`ml-auto font-mono text-[clamp(0.5rem,0.9vw,0.65rem)]
                  px-1 rounded border hidden sm:inline
                  ${
                    isActive
                      ? "border-white/30 text-white/70"
                      : "border-white/10 text-white/30"
                  }`}
              >
                {option.key}
              </kbd>
            </button>
          );
        })}
      </div>
    </div>
  );
}
