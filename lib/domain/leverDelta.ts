import { NBALever } from "./nbaLevers";

export type LeverStatus =
  | "expected"   // conforme à l’attente
  | "stronger"   // plus fort que prévu
  | "weaker"     // plus faible que prévu
  | "new";       // non prioritaire pré-game, devenu déterminant

export interface LeverWithImpact {
  lever: string;        // label (doit exister dans nbaLevers)
  contribution: number;
  rationale: string;
}

export interface LeverWithStatus extends LeverWithImpact {
  status: LeverStatus;
}

/**
 * computeLeverDelta
 * -----------------
 * Compare expected (RAI) and observed (PAI) top levers
 * and assigns a structural status to each observed lever.
 *
 * RULES (FIXED):
 * 1. Lever ∈ expected AND ∈ observed
 *    → expected / stronger / weaker (based on sign)
 *
 * 2. Lever ∉ expected AND ∈ observed
 *    → new
 *
 * NOTE:
 * - We do NOT invent levers
 * - We do NOT change rankings
 * - We only qualify deviation vs expectation
 */
export function computeLeverDelta(
  expectedLevers: LeverWithImpact[],
  observedLevers: LeverWithImpact[]
): LeverWithStatus[] {
  const expectedMap = new Map(
    expectedLevers.map(l => [l.lever, l])
  );

  return observedLevers.map(observed => {
    const expected = expectedMap.get(observed.lever);

    // CASE 3 — NEW lever (not prioritized pre-game)
    if (!expected) {
      return {
        ...observed,
        status: "new"
      };
    }

    // CASE 1 & 2 — Lever was expected
    // Sign-based deviation (simple, robust, explainable)
    if (observed.contribution < 0) {
      return {
        ...observed,
        status: "weaker"
      };
    }

    if (observed.contribution > 0) {
      return {
        ...observed,
        status: "stronger"
      };
    }

    // Neutral / unchanged
    return {
      ...observed,
      status: "expected"
    };
  });
}
