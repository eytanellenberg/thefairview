// lib/nflBigScore.ts
// FAIR NFL — Big score (blowout-aware) PAI computation

export type TeamSide = "home" | "away";

export interface Lever {
  lever: string;
  value: number; // signed delta
}

export interface TeamExecution {
  team: string;
  scoreFor: number;
  scoreAgainst: number;
  levers: Lever[];
}

export interface MatchPAI {
  margin: number;
  blowoutFactor: number;
  home: TeamExecution;
  away: TeamExecution;
}

/**
 * Compute blowout amplification factor
 * NFL calibration (empirical / conservative)
 */
export function computeBlowoutFactor(margin: number): number {
  if (margin < 7) return 1.0;        // one-score game
  if (margin < 14) return 1.4;       // solid win
  if (margin < 21) return 1.9;       // strong win
  if (margin < 28) return 2.6;       // blowout
  return 3.3;                        // massacre
}

/**
 * Generate signed PAI deltas from score margin
 */
export function computeBigScorePAI(params: {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}): MatchPAI {
  const { homeTeam, awayTeam, homeScore, awayScore } = params;

  const margin = Math.abs(homeScore - awayScore);
  const blowoutFactor = computeBlowoutFactor(margin);

  const homeWon = homeScore > awayScore;

  function teamLevers(winner: boolean): Lever[] {
    const sign = winner ? 1 : -1;

    return [
      {
        lever: "Early-down efficiency",
        value: +(sign * 0.45 * blowoutFactor).toFixed(2),
      },
      {
        lever: "Pass protection integrity",
        value: +(sign * 0.35 * blowoutFactor).toFixed(2),
      },
      {
        lever: "Coverage matchup stress",
        value: +(sign * 0.40 * blowoutFactor).toFixed(2),
      },
    ];
  }

  return {
    margin,
    blowoutFactor: +blowoutFactor.toFixed(2),

    home: {
      team: homeTeam,
      scoreFor: homeScore,
      scoreAgainst: awayScore,
      levers: teamLevers(homeWon),
    },

    away: {
      team: awayTeam,
      scoreFor: awayScore,
      scoreAgainst: homeScore,
      levers: teamLevers(!homeWon),
    },
  };
}
