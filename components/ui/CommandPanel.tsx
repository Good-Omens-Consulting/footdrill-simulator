"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDrillStore } from "@/lib/store";
import { DRILL_COMMANDS, getCommandsByCategory, isCommandValid } from "@/lib/drill-commands";
import { speakCommand, initSpeech } from "@/lib/speech";

/** Keyboard keys reserved for non-drill shortcuts (camera, help, etc.) */
const RESERVED_KEYS = new Set(["1", "2", "3", "4", "?"]);

/** Category labels for display */
const CATEGORY_LABELS: Record<string, string> = {
  posture: "Posture",
  march: "March",
  turn: "Turn",
  formation: "Formation",
  ceremony: "Ceremony",
  dismiss: "Dismiss",
};

export default function CommandPanel() {
  const drillState = useDrillStore((s) => s.drillState);
  const showHelp = useDrillStore((s) => s.showHelp);
  const isTransitioning = useDrillStore((s) => s.isTransitioning);
  const toggleHelp = useDrillStore((s) => s.toggleHelp);
  const issueCommand = useDrillStore((s) => s.issueCommand);

  const [flashedKey, setFlashedKey] = useState<string | null>(null);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize speech on mount
  useEffect(() => {
    initSpeech();
  }, []);

  // Keyboard handler for drill commands + help toggle
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Toggle help panel
      if (key === "?") {
        toggleHelp();
        return;
      }

      // Skip reserved keys (camera shortcuts handled by CameraToggle)
      if (RESERVED_KEYS.has(key)) return;

      // Try to issue a drill command
      const success = issueCommand(key);
      if (success) {
        // Find the command to get its speech text
        const cmd = DRILL_COMMANDS.find((c) => c.key === key);
        if (cmd) {
          const fullText = cmd.cautionary
            ? `${cmd.cautionary}, ${cmd.executive}`
            : cmd.executive;
          speakCommand(fullText);

          // Flash the key
          setFlashedKey(key);
          if (flashTimeout.current) clearTimeout(flashTimeout.current);
          flashTimeout.current = setTimeout(() => setFlashedKey(null), 400);
        }
      }
    },
    [issueCommand, toggleHelp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Cleanup flash timeout
  useEffect(() => {
    return () => {
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, []);

  const commandsByCategory = getCommandsByCategory();

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none max-w-[clamp(16rem,30vw,22rem)]">
      {/* Toggle button — always visible */}
      <button
        onClick={toggleHelp}
        className="pointer-events-auto mb-2 flex items-center gap-1.5
          bg-black/60 backdrop-blur-md border border-white/10 rounded-lg
          px-3 py-1.5 text-white/70 hover:text-white hover:bg-black/80
          transition-colors text-[clamp(0.7rem,1.2vw,0.85rem)]"
      >
        <span className="font-mono">?</span>
        <span>{showHelp ? "Hide" : "Show"} Commands</span>
      </button>

      {/* Command list */}
      {showHelp && (
        <div
          className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10
            rounded-xl p-3 space-y-3 max-h-[clamp(20rem,50vh,36rem)] overflow-y-auto
            scrollbar-thin scrollbar-thumb-white/20"
        >
          {Object.entries(commandsByCategory).map(([category, commands]) => (
            <div key={category}>
              <h3
                className="text-[clamp(0.6rem,1vw,0.7rem)] font-semibold uppercase tracking-wider
                  text-white/40 mb-1.5"
              >
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="space-y-0.5">
                {commands.map((cmd) => {
                  const valid = isCommandValid(cmd, drillState);
                  const flashed = flashedKey === cmd.key;

                  return (
                    <button
                      key={cmd.id}
                      disabled={!valid || isTransitioning}
                      onClick={() => {
                        if (!valid || isTransitioning) return;
                        const success = issueCommand(cmd.key);
                        if (success) {
                          const fullText = cmd.cautionary
                            ? `${cmd.cautionary}, ${cmd.executive}`
                            : cmd.executive;
                          speakCommand(fullText);
                          setFlashedKey(cmd.key);
                          if (flashTimeout.current) clearTimeout(flashTimeout.current);
                          flashTimeout.current = setTimeout(() => setFlashedKey(null), 400);
                        }
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200
                        text-[clamp(0.7rem,1.2vw,0.85rem)]
                        ${
                          flashed
                            ? "bg-amber-500/40 text-white scale-105"
                            : valid
                              ? "text-white/90 hover:bg-white/10 cursor-pointer"
                              : "text-white/25 cursor-not-allowed"
                        }`}
                    >
                      <kbd
                        className={`inline-flex items-center justify-center
                          min-w-[clamp(1.2rem,2vw,1.6rem)] h-[clamp(1.2rem,2vw,1.6rem)]
                          rounded font-mono font-bold text-[clamp(0.6rem,1vw,0.75rem)]
                          border transition-colors duration-200
                          ${
                            flashed
                              ? "bg-amber-400 border-amber-300 text-black"
                              : valid
                                ? "bg-white/10 border-white/20 text-white"
                                : "bg-white/5 border-white/10 text-white/25"
                          }`}
                      >
                        {cmd.key.toUpperCase()}
                      </kbd>
                      <span className="truncate">{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile compact version */}
      {showHelp && (
        <div
          className="pointer-events-auto sm:hidden mt-2 bg-black/60 backdrop-blur-md
            border border-white/10 rounded-xl p-2"
        >
          <p className="text-white/50 text-[clamp(0.6rem,1vw,0.7rem)] text-center">
            Tap commands above or use keyboard
          </p>
        </div>
      )}
    </div>
  );
}
