import type { DrillCommand } from "./types";
import { DrillState } from "./types";
export type { DrillCommand } from "./types";

/** All stationary states (not actively moving) */
const STATIONARY: DrillState[] = [
  "attention",
  "stand_at_ease",
  "stand_easy",
  "halt",
  "right_dress",
  "eyes_front",
  "salute",
  "open_order",
  "close_order",
];

/** States where the squad is marching */
const MARCHING: DrillState[] = ["quick_march", "double_march", "mark_time"];

/** Complete drill command definitions */
export const DRILL_COMMANDS: DrillCommand[] = [
  // Posture commands
  {
    id: "attention",
    label: "Attention",
    key: "a",
    cautionary: "Squad",
    executive: "Atten-SHUN!",
    validFrom: ["stand_at_ease", "stand_easy", "halt", "right_dress", "eyes_front", "open_order", "close_order"],
    category: "posture",
  },
  {
    id: "stand_at_ease",
    label: "Stand at Ease",
    key: "e",
    cautionary: "Squad",
    executive: "Stand at... EASE!",
    validFrom: ["attention"],
    category: "posture",
  },
  {
    id: "stand_easy",
    label: "Stand Easy",
    key: "s",
    cautionary: "",
    executive: "Stand... EASY!",
    validFrom: ["stand_at_ease"],
    category: "posture",
  },

  // March commands
  {
    id: "quick_march",
    label: "Quick March",
    key: "q",
    cautionary: "Squad",
    executive: "Quick... MARCH!",
    validFrom: ["attention", "halt", "mark_time"],
    category: "march",
  },
  {
    id: "halt",
    label: "Halt",
    key: "h",
    cautionary: "Squad",
    executive: "Squad... HALT!",
    validFrom: [...MARCHING],
    category: "march",
  },
  {
    id: "mark_time",
    label: "Mark Time",
    key: "m",
    cautionary: "Squad",
    executive: "Mark... TIME!",
    validFrom: ["quick_march", "attention", "halt"],
    category: "march",
  },
  {
    id: "double_march",
    label: "Double March",
    key: "d",
    cautionary: "Squad",
    executive: "Double... MARCH!",
    validFrom: ["attention", "halt", "quick_march", "mark_time"],
    category: "march",
  },

  // Turn commands
  {
    id: "left_turn",
    label: "Left Turn",
    key: "l",
    cautionary: "Squad",
    executive: "Left... TURN!",
    validFrom: [...STATIONARY, ...MARCHING],
    category: "turn",
  },
  {
    id: "right_turn",
    label: "Right Turn",
    key: "r",
    cautionary: "Squad",
    executive: "Right... TURN!",
    validFrom: [...STATIONARY, ...MARCHING],
    category: "turn",
  },
  {
    id: "about_turn",
    label: "About Turn",
    key: "t",
    cautionary: "Squad",
    executive: "About... TURN!",
    validFrom: [...STATIONARY, ...MARCHING],
    category: "turn",
  },

  // Formation commands
  {
    id: "right_dress",
    label: "Right Dress",
    key: "g",
    cautionary: "Squad",
    executive: "Right... DRESS!",
    validFrom: ["attention"],
    category: "formation",
  },
  {
    id: "eyes_front",
    label: "Eyes Front",
    key: "f",
    cautionary: "",
    executive: "Eyes... FRONT!",
    validFrom: ["right_dress"],
    category: "formation",
  },
  {
    id: "open_order",
    label: "Open Order",
    key: "o",
    cautionary: "Squad",
    executive: "Open order... MARCH!",
    validFrom: ["attention"],
    category: "formation",
  },
  {
    id: "close_order",
    label: "Close Order",
    key: "c",
    cautionary: "Squad",
    executive: "Close order... MARCH!",
    validFrom: ["attention", "open_order"],
    category: "formation",
  },

  // Ceremony
  {
    id: "salute",
    label: "Salute",
    key: "u",
    cautionary: "Squad",
    executive: "To the front... SALUTE!",
    validFrom: ["attention"],
    category: "ceremony",
  },

  // Dismiss
  {
    id: "dismiss",
    label: "Dismiss",
    key: "x",
    cautionary: "Squad",
    executive: "Squad... DISMISS!",
    validFrom: ["attention"],
    category: "dismiss",
  },
  {
    id: "fall_out",
    label: "Fall Out",
    key: "p",
    cautionary: "",
    executive: "Fall... OUT!",
    validFrom: ["attention", "stand_at_ease"],
    category: "dismiss",
  },
];

/** Get command by keyboard key */
export function getCommandByKey(key: string): DrillCommand | undefined {
  return DRILL_COMMANDS.find((c) => c.key === key.toLowerCase());
}

/** Check if a command is valid from the current state */
export function isCommandValid(command: DrillCommand, currentState: DrillState): boolean {
  return command.validFrom.includes(currentState);
}

/** Get all valid commands from the current state */
export function getValidCommands(currentState: DrillState): DrillCommand[] {
  return DRILL_COMMANDS.filter((c) => c.validFrom.includes(currentState));
}

/** Group commands by category */
export function getCommandsByCategory(): Record<string, DrillCommand[]> {
  const groups: Record<string, DrillCommand[]> = {};
  for (const cmd of DRILL_COMMANDS) {
    if (!groups[cmd.category]) groups[cmd.category] = [];
    groups[cmd.category].push(cmd);
  }
  return groups;
}
