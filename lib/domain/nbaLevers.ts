/**
 * NBA Structural Levers
 * ---------------------
 * Source of truth for all RAI / PAI analyses.
 * Same levers are used pre-game (expected impact)
 * and post-game (observed execution).
 */

export type LeverCategory =
  | "offense"
  | "defense"
  | "context"
  | "execution";

export interface NBALever {
  key: string;              // stable internal id
  label: string;            // displayed name (must stay identical pre/post)
  category: LeverCategory;
  description: string;      // short, human-readable explanation
}

/**
 * GLOBAL NBA LEVER LIST
 * --------------------
 * Do NOT add match-specific levers elsewhere.
 * If a lever appears in PAI but not in RAI Top 3,
 * it must already exist here and be flagged as NEW.
 */

export const NBA_LEVERS: NBALever[] = [
  /* =====================
     OFFENSIVE STRUCTURE
     ===================== */

  {
    key: "shot_quality_creation",
    label: "Shot quality creation",
    category: "offense",
    description:
      "Ability to generate open or high-value shots within the offensive structure"
  },
  {
    key: "offensive_spacing_coherence",
    label: "Offensive spacing coherence",
    category: "offense",
    description:
      "Role alignment and floor spacing efficiency in half-court offense"
  },
  {
    key: "half_court_execution_efficiency",
    label: "Half-court execution efficiency",
    category: "execution",
    description:
      "Capacity to execute structured sets under defensive pressure"
  },

  /* =====================
     DEFENSIVE STRUCTURE
     ===================== */

  {
    key: "defensive_scheme_continuity",
    label: "Defensive scheme continuity",
    category: "defense",
    description:
      "Stability and consistency of defensive principles across recent games"
  },
  {
    key: "defensive_rotation_latency",
    label: "Defensive rotation latency",
    category: "defense",
    description:
      "Timeliness of help defense and close-outs on ball movement"
  },
  {
    key: "perimeter_containment",
    label: "Perimeter containment",
    category: "defense",
    description:
      "Ability to limit dribble penetration and first-step advantages"
  },

  /* =====================
     MATCHUP / CONTEXT
     ===================== */

  {
    key: "pnr_matchup_stress",
    label: "PnR matchup stress",
    category: "context",
    description:
      "Degree of structural strain induced by opponent pick-and-roll profile"
  },
  {
    key: "transition_control",
    label: "Transition control",
    category: "context",
    description:
      "Ability to prevent or capitalize on fast-break and early offense situations"
  },

  /* =====================
     EXECUTIONAL STABILITY
     ===================== */

  {
    key: "turnover_pressure_handling",
    label: "Turnover pressure handling",
    category: "execution",
    description:
      "Ball security and decision-making under defensive pressure"
  }
];

/**
 * Utility helpers (optional but recommended)
 */

export function getLeverByLabel(label: string): NBALever | undefined {
  return NBA_LEVERS.find(l => l.label === label);
}

export function isValidLever(label: string): boolean {
  return NBA_LEVERS.some(l => l.label === label);
}
