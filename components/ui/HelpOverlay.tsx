"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "footdrill-help-dismissed";

/** Key controls to show in the help overlay */
const KEY_GROUPS = [
  {
    title: "Posture",
    keys: [
      { key: "A", desc: "Attention" },
      { key: "E", desc: "Stand at Ease" },
      { key: "S", desc: "Stand Easy" },
    ],
  },
  {
    title: "March",
    keys: [
      { key: "Q", desc: "Quick March" },
      { key: "H", desc: "Halt" },
      { key: "M", desc: "Mark Time" },
      { key: "D", desc: "Double March" },
    ],
  },
  {
    title: "Turn",
    keys: [
      { key: "L", desc: "Left Turn" },
      { key: "R", desc: "Right Turn" },
      { key: "T", desc: "About Turn" },
    ],
  },
  {
    title: "Other",
    keys: [
      { key: "?", desc: "Toggle command panel" },
      { key: "1-4", desc: "Switch camera view" },
    ],
  },
];

export default function HelpOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setIsVisible(true);
      }
    } catch {
      // localStorage might not be available
      setIsVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Dismiss on any keypress or click
  useEffect(() => {
    if (!isVisible) return;

    const handleDismiss = () => dismiss();

    window.addEventListener("keydown", handleDismiss);
    window.addEventListener("click", handleDismiss);

    return () => {
      window.removeEventListener("keydown", handleDismiss);
      window.removeEventListener("click", handleDismiss);
    };
  }, [isVisible, dismiss]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center
        bg-black/80 backdrop-blur-lg cursor-pointer"
    >
      <div
        className="bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl
          p-[clamp(1.5rem,4vw,3rem)] max-w-[clamp(20rem,60vw,36rem)] w-full mx-4
          text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="space-y-2">
          <h1
            className="text-white font-bold tracking-tight
              text-[clamp(1.5rem,3.5vw,2.5rem)]"
          >
            Foot Drill Simulator
          </h1>
          <p className="text-white/50 text-[clamp(0.75rem,1.3vw,1rem)]">
            Issue drill commands using keyboard shortcuts.
            <br className="hidden sm:inline" />{" "}
            Watch your squad execute in formation.
          </p>
        </div>

        {/* Key controls grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          {KEY_GROUPS.map((group) => (
            <div key={group.title}>
              <h3
                className="text-white/40 font-semibold uppercase tracking-wider
                  text-[clamp(0.55rem,0.9vw,0.65rem)] mb-2"
              >
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.keys.map((k) => (
                  <div key={k.key} className="flex items-center gap-1.5">
                    <kbd
                      className="inline-flex items-center justify-center
                        min-w-[clamp(1.2rem,2vw,1.6rem)] h-[clamp(1.2rem,2vw,1.6rem)]
                        rounded bg-white/10 border border-white/20
                        font-mono font-bold text-white
                        text-[clamp(0.55rem,0.9vw,0.7rem)]"
                    >
                      {k.key}
                    </kbd>
                    <span className="text-white/60 text-[clamp(0.6rem,1vw,0.75rem)]">
                      {k.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="space-y-3 pt-2">
          <button
            onClick={dismiss}
            className="px-6 py-2.5 bg-amber-500/20 hover:bg-amber-500/30
              text-amber-300 border border-amber-500/30 rounded-xl
              font-semibold transition-colors
              text-[clamp(0.8rem,1.3vw,1rem)]"
          >
            Start Drill
          </button>
          <p className="text-white/30 text-[clamp(0.6rem,1vw,0.7rem)]">
            or press any key to begin
          </p>
        </div>
      </div>
    </div>
  );
}
