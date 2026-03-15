"use client";

import { useState } from "react";
import { useDrillStore } from "@/lib/store";
import type { Environment } from "@/lib/types";

interface EnvironmentOption {
  value: Environment;
  label: string;
}

const ENVIRONMENTS: EnvironmentOption[] = [
  { value: "military", label: "Military" },
  { value: "scout_camp", label: "Scout Camp" },
  { value: "plain", label: "Plain" },
];

const SPEED_PRESETS = [0.25, 0.5, 1, 1.5, 2];

export default function SquadControls() {
  const [isOpen, setIsOpen] = useState(false);

  const squadConfig = useDrillStore((s) => s.squadConfig);
  const environment = useDrillStore((s) => s.environment);
  const speed = useDrillStore((s) => s.speed);
  const setSquadConfig = useDrillStore((s) => s.setSquadConfig);
  const setEnvironment = useDrillStore((s) => s.setEnvironment);
  const setSpeed = useDrillStore((s) => s.setSpeed);

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      {/* Toggle button */}
      <div className="pointer-events-auto flex justify-end">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="mb-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md
            border border-white/10 rounded-lg px-3 py-1.5
            text-white/70 hover:text-white hover:bg-black/80
            transition-colors text-[clamp(0.7rem,1.2vw,0.85rem)]"
        >
          <svg
            className="w-[clamp(0.85rem,1.3vw,1rem)] h-[clamp(0.85rem,1.3vw,1rem)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{isOpen ? "Hide" : "Settings"}</span>
        </button>
      </div>

      {/* Controls panel */}
      {isOpen && (
        <div
          className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10
            rounded-xl p-4 space-y-4 w-[clamp(14rem,28vw,20rem)]"
        >
          {/* Squad count */}
          <div>
            <label className="flex items-center justify-between text-white/60 text-[clamp(0.6rem,1vw,0.75rem)] mb-1.5">
              <span>Squad Size</span>
              <span className="font-mono text-white">{squadConfig.count}</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSquadConfig({ count: Math.max(4, squadConfig.count - 1) })
                }
                disabled={squadConfig.count <= 4}
                className="w-[clamp(1.5rem,2.5vw,2rem)] h-[clamp(1.5rem,2.5vw,2rem)]
                  rounded-lg bg-white/10 text-white hover:bg-white/20
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center
                  text-[clamp(0.8rem,1.3vw,1rem)] font-bold"
              >
                -
              </button>
              <input
                type="range"
                min={4}
                max={36}
                value={squadConfig.count}
                onChange={(e) =>
                  setSquadConfig({ count: parseInt(e.target.value, 10) })
                }
                className="flex-1 accent-amber-400 h-1 bg-white/10 rounded-full
                  appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-amber-400"
              />
              <button
                onClick={() =>
                  setSquadConfig({ count: Math.min(36, squadConfig.count + 1) })
                }
                disabled={squadConfig.count >= 36}
                className="w-[clamp(1.5rem,2.5vw,2rem)] h-[clamp(1.5rem,2.5vw,2rem)]
                  rounded-lg bg-white/10 text-white hover:bg-white/20
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center
                  text-[clamp(0.8rem,1.3vw,1rem)] font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Ranks */}
          <div>
            <label className="flex items-center justify-between text-white/60 text-[clamp(0.6rem,1vw,0.75rem)] mb-1.5">
              <span>Ranks</span>
              <span className="font-mono text-white">{squadConfig.ranks}</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSquadConfig({ ranks: Math.max(1, squadConfig.ranks - 1) })
                }
                disabled={squadConfig.ranks <= 1}
                className="w-[clamp(1.5rem,2.5vw,2rem)] h-[clamp(1.5rem,2.5vw,2rem)]
                  rounded-lg bg-white/10 text-white hover:bg-white/20
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center
                  text-[clamp(0.8rem,1.3vw,1rem)] font-bold"
              >
                -
              </button>
              <input
                type="range"
                min={1}
                max={4}
                value={squadConfig.ranks}
                onChange={(e) =>
                  setSquadConfig({ ranks: parseInt(e.target.value, 10) })
                }
                className="flex-1 accent-amber-400 h-1 bg-white/10 rounded-full
                  appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-amber-400"
              />
              <button
                onClick={() =>
                  setSquadConfig({ ranks: Math.min(4, squadConfig.ranks + 1) })
                }
                disabled={squadConfig.ranks >= 4}
                className="w-[clamp(1.5rem,2.5vw,2rem)] h-[clamp(1.5rem,2.5vw,2rem)]
                  rounded-lg bg-white/10 text-white hover:bg-white/20
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center
                  text-[clamp(0.8rem,1.3vw,1rem)] font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Environment */}
          <div>
            <label className="block text-white/60 text-[clamp(0.6rem,1vw,0.75rem)] mb-1.5">
              Environment
            </label>
            <div className="flex gap-1">
              {ENVIRONMENTS.map((env) => (
                <button
                  key={env.value}
                  onClick={() => setEnvironment(env.value)}
                  className={`flex-1 px-2 py-1.5 rounded-lg transition-all duration-200
                    text-[clamp(0.6rem,1vw,0.75rem)] font-medium
                    ${
                      environment === env.value
                        ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                        : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10 hover:text-white/70"
                    }`}
                >
                  {env.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <label className="flex items-center justify-between text-white/60 text-[clamp(0.6rem,1vw,0.75rem)] mb-1.5">
              <span>Speed</span>
              <span className="font-mono text-white">{speed}x</span>
            </label>
            <div className="flex gap-1">
              {SPEED_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSpeed(preset)}
                  className={`flex-1 px-1 py-1.5 rounded-lg transition-all duration-200
                    text-[clamp(0.55rem,0.9vw,0.7rem)] font-mono
                    ${
                      speed === preset
                        ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                        : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10 hover:text-white/70"
                    }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
