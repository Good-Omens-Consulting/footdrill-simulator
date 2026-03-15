"use client";

import dynamic from "next/dynamic";
import CommandPanel from "@/components/ui/CommandPanel";
import StatusBar from "@/components/ui/StatusBar";
import CameraToggle from "@/components/ui/CameraToggle";
import SquadControls from "@/components/ui/SquadControls";
import CommandLog from "@/components/ui/CommandLog";
import HelpOverlay from "@/components/ui/HelpOverlay";

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-neutral-400 animate-pulse-dot" />
          <span
            className="inline-block w-2 h-2 rounded-full bg-neutral-400 animate-pulse-dot"
            style={{ animationDelay: "0.3s" }}
          />
          <span
            className="inline-block w-2 h-2 rounded-full bg-neutral-400 animate-pulse-dot"
            style={{ animationDelay: "0.6s" }}
          />
        </div>
        <p className="text-neutral-400 text-sm tracking-wide">
          Loading Drill Simulator...
        </p>
      </div>
    </div>
  );
}

const DrillScene = dynamic(() => import("@/components/scene/DrillScene"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Canvas - fills entire viewport */}
      <DrillScene />

      {/* UI Overlays - float on top of the 3D scene */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <StatusBar />
        <CameraToggle />
        <CommandPanel />
        <SquadControls />
        <CommandLog />
        <HelpOverlay />
      </div>
    </main>
  );
}
