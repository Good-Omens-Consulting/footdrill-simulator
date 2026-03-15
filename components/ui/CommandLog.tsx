"use client";

import { useEffect, useRef } from "react";
import { useDrillStore } from "@/lib/store";

export default function CommandLog() {
  const commandLog = useDrillStore((s) => s.commandLog);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  // Inject keyframes once on mount
  useEffect(() => {
    const styleId = "command-log-keyframes";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(0.5rem); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (commandLog.length > prevLengthRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevLengthRef.current = commandLog.length;
  }, [commandLog.length]);

  if (commandLog.length === 0) return null;

  // Show only last 10
  const visibleLog = commandLog.slice(-10);

  return (
    <div className="fixed bottom-[clamp(14rem,35vh,22rem)] left-4 z-40 pointer-events-none">
      <div
        ref={scrollRef}
        className="pointer-events-auto bg-black/40 backdrop-blur-sm border border-white/5
          rounded-xl p-2.5 w-[clamp(12rem,22vw,16rem)]
          max-h-[clamp(8rem,18vh,12rem)] overflow-y-auto
          scrollbar-thin scrollbar-thumb-white/10"
      >
        <h4
          className="text-[clamp(0.5rem,0.8vw,0.6rem)] font-semibold uppercase tracking-wider
            text-white/30 mb-1.5"
        >
          Command Log
        </h4>
        <div className="space-y-0.5">
          {visibleLog.map((entry, index) => {
            const globalIndex = commandLog.length - visibleLog.length + index;
            return (
              <div
                key={`${globalIndex}-${entry}`}
                className="text-white/60 text-[clamp(0.6rem,1vw,0.7rem)] font-mono
                  py-0.5 px-1.5 rounded"
                style={{
                  animation: "fadeSlideIn 0.3s ease-out forwards",
                }}
              >
                <span className="text-white/25 mr-1.5">
                  {String(globalIndex + 1).padStart(2, "0")}
                </span>
                {entry}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
