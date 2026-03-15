/** All possible drill states a soldier can be in */
export type DrillState =
  | "attention"
  | "stand_at_ease"
  | "stand_easy"
  | "quick_march"
  | "halt"
  | "mark_time"
  | "left_turn"
  | "right_turn"
  | "about_turn"
  | "right_dress"
  | "eyes_front"
  | "salute"
  | "open_order"
  | "close_order"
  | "double_march"
  | "dismiss"
  | "fall_out";

/** A drill command definition */
export interface DrillCommand {
  id: DrillState;
  /** Display name for UI */
  label: string;
  /** Keyboard shortcut key (lowercase) */
  key: string;
  /** Cautionary word (e.g. "Squad...") */
  cautionary: string;
  /** Executive word (e.g. "...Atten-SHUN!") */
  executive: string;
  /** Which states this command can be issued from */
  validFrom: DrillState[];
  /** Category for grouping in UI */
  category: "posture" | "march" | "turn" | "formation" | "ceremony" | "dismiss";
}

/** Camera view presets */
export type CameraView = "orbit" | "top_down" | "parade" | "follow";

/** Environment presets */
export type Environment = "military" | "scout_camp" | "plain";

/** Squad configuration */
export interface SquadConfig {
  /** Total number of soldiers (excluding drill sergeant) */
  count: number;
  /** Number of ranks (rows) */
  ranks: number;
  /** Spacing between soldiers in a rank (metres) */
  fileSpacing: number;
  /** Spacing between ranks (metres) */
  rankSpacing: number;
}

/** Position and rotation of a single soldier in the formation */
export interface SoldierPosition {
  x: number;
  z: number;
  rotation: number; // radians, 0 = facing -Z (toward camera in default view)
}

/** Pose definition for a soldier's limbs (angles in radians) */
export interface SoldierPose {
  // Body
  bodyY: number; // vertical offset (for marching bob)
  bodyLean: number; // forward lean angle

  // Arms
  leftArmSwing: number; // forward/back swing
  rightArmSwing: number;
  leftArmOut: number; // sideways (for at ease, salute)
  rightArmOut: number;
  leftForearmBend: number;
  rightForearmBend: number;

  // Legs
  leftLegSwing: number;
  rightLegSwing: number;
  leftKneeBend: number;
  rightKneeBend: number;

  // Head
  headTurn: number;
}

/** Default pose (attention) */
export const DEFAULT_POSE: SoldierPose = {
  bodyY: 0,
  bodyLean: 0,
  leftArmSwing: 0,
  rightArmSwing: 0,
  leftArmOut: 0,
  rightArmOut: 0,
  leftForearmBend: 0,
  rightForearmBend: 0,
  leftLegSwing: 0,
  rightLegSwing: 0,
  leftKneeBend: 0,
  rightKneeBend: 0,
  headTurn: 0,
};
