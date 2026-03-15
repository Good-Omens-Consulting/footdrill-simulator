import { create } from "zustand";
import {
  DrillState,
  CameraView,
  Environment,
  SquadConfig,
  SoldierPosition,
} from "./types";
import { getCommandByKey, isCommandValid, DrillCommand } from "./drill-commands";

interface DrillStore {
  // Squad state
  drillState: DrillState;
  previousState: DrillState;
  squadConfig: SquadConfig;
  soldierPositions: SoldierPosition[];
  facingAngle: number; // global facing direction in radians

  // Transition
  isTransitioning: boolean;
  transitionProgress: number;
  activeCommand: DrillCommand | null;

  // UI state
  cameraView: CameraView;
  environment: Environment;
  showHelp: boolean;
  lastCommandText: string;
  commandLog: string[];
  speed: number; // playback speed multiplier (for slow-mo)

  // Actions
  issueCommand: (key: string) => boolean;
  setDrillState: (state: DrillState) => void;
  setCameraView: (view: CameraView) => void;
  setEnvironment: (env: Environment) => void;
  setSquadConfig: (config: Partial<SquadConfig>) => void;
  toggleHelp: () => void;
  setTransitioning: (transitioning: boolean) => void;
  setTransitionProgress: (progress: number) => void;
  completeTransition: () => void;
  setSpeed: (speed: number) => void;
  updateFacingAngle: (delta: number) => void;
  recalculatePositions: () => void;
}

/** Calculate soldier positions for a given squad config and facing angle */
function calculatePositions(config: SquadConfig, facingAngle: number): SoldierPosition[] {
  const positions: SoldierPosition[] = [];
  const filesPerRank = Math.ceil(config.count / config.ranks);

  let placed = 0;
  for (let rank = 0; rank < config.ranks && placed < config.count; rank++) {
    const soldiersInThisRank = Math.min(filesPerRank, config.count - placed);
    const rankOffset = (soldiersInThisRank - 1) * config.fileSpacing * 0.5;

    for (let file = 0; file < soldiersInThisRank; file++) {
      // Local position (before rotation)
      const localX = file * config.fileSpacing - rankOffset;
      const localZ = rank * config.rankSpacing;

      // Rotate around origin by facing angle
      const cos = Math.cos(facingAngle);
      const sin = Math.sin(facingAngle);
      const x = localX * cos - localZ * sin;
      const z = localX * sin + localZ * cos;

      positions.push({ x, z, rotation: facingAngle });
      placed++;
    }
  }

  return positions;
}

const DEFAULT_CONFIG: SquadConfig = {
  count: 12,
  ranks: 3,
  fileSpacing: 1.2,
  rankSpacing: 1.5,
};

export const useDrillStore = create<DrillStore>((set, get) => ({
  // Initial state
  drillState: "stand_at_ease",
  previousState: "stand_at_ease",
  squadConfig: DEFAULT_CONFIG,
  soldierPositions: calculatePositions(DEFAULT_CONFIG, 0),
  facingAngle: 0,

  // Transition
  isTransitioning: false,
  transitionProgress: 0,
  activeCommand: null,

  // UI
  cameraView: "parade",
  environment: "military",
  showHelp: true,
  lastCommandText: "",
  commandLog: [],
  speed: 1,

  // Actions
  issueCommand: (key: string) => {
    const state = get();
    if (state.isTransitioning) return false;

    const command = getCommandByKey(key);
    if (!command) return false;
    if (!isCommandValid(command, state.drillState)) return false;

    const fullCommand = command.cautionary
      ? `${command.cautionary}, ${command.executive}`
      : command.executive;

    set({
      activeCommand: command,
      isTransitioning: true,
      transitionProgress: 0,
      previousState: state.drillState,
      lastCommandText: fullCommand,
      commandLog: [...state.commandLog.slice(-19), fullCommand],
    });

    return true;
  },

  setDrillState: (drillState) => set({ drillState }),

  setCameraView: (cameraView) => set({ cameraView }),

  setEnvironment: (environment) => set({ environment }),

  setSquadConfig: (partial) => {
    const state = get();
    const newConfig = { ...state.squadConfig, ...partial };
    set({
      squadConfig: newConfig,
      soldierPositions: calculatePositions(newConfig, state.facingAngle),
    });
  },

  toggleHelp: () => set((s) => ({ showHelp: !s.showHelp })),

  setTransitioning: (isTransitioning) => set({ isTransitioning }),

  setTransitionProgress: (transitionProgress) => set({ transitionProgress }),

  completeTransition: () => {
    const state = get();
    if (!state.activeCommand) return;

    // For turns, update facing angle and recalculate positions
    let newFacingAngle = state.facingAngle;
    if (state.activeCommand.id === "left_turn") {
      newFacingAngle += Math.PI / 2;
    } else if (state.activeCommand.id === "right_turn") {
      newFacingAngle -= Math.PI / 2;
    } else if (state.activeCommand.id === "about_turn") {
      newFacingAngle += Math.PI;
    }

    // Normalize angle
    newFacingAngle = ((newFacingAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Determine the resulting state after transition
    let resultState: DrillState = state.activeCommand.id;

    // Turns are instantaneous - return to previous movement state
    if (["left_turn", "right_turn", "about_turn"].includes(state.activeCommand.id)) {
      if (["quick_march", "double_march", "mark_time"].includes(state.previousState)) {
        resultState = state.previousState;
      } else {
        resultState = "attention";
      }
    }

    // Salute returns to attention after completion
    if (state.activeCommand.id === "salute") {
      resultState = "attention";
    }

    set({
      drillState: resultState,
      isTransitioning: false,
      transitionProgress: 1,
      activeCommand: null,
      facingAngle: newFacingAngle,
      soldierPositions: calculatePositions(state.squadConfig, newFacingAngle),
    });
  },

  setSpeed: (speed) => set({ speed }),

  updateFacingAngle: (delta) => {
    const state = get();
    const newAngle = state.facingAngle + delta;
    set({
      facingAngle: newAngle,
      soldierPositions: calculatePositions(state.squadConfig, newAngle),
    });
  },

  recalculatePositions: () => {
    const state = get();
    set({
      soldierPositions: calculatePositions(state.squadConfig, state.facingAngle),
    });
  },
}));
