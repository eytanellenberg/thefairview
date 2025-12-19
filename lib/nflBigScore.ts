// lib/nflBigScore.ts

export type NFLBigScoreLever = {
  lever: string;
  value: number;
};

export type NFLBigScoreMatch = {
  matchup: string;
  finalScore: string;
  raiEdge: {
    team: string;
    value: number;
    levers: NFLBigScoreLever[];
  };
  pai: {
    teamA: {
      team: string;
      score: string;
      levers: NFLBigScoreLever[];
    };
    teamB: {
      team: string;
      score: string;
      levers: NFLBigScoreLever[];
    };
  };
};

export type NFLBigScoreSnapshot = {
  sport: "nfl";
  updatedAt: string;
  matches: NFLBigScoreMatch[];
};

/**
 * MAIN EXPORT — this is what the page imports
 */
export function computeNFLBigScoreSnapshot(): NFLBigScoreSnapshot {
  return {
    sport: "nfl",
    updatedAt: new Date().toISOString(),
    matches: [
      {
        matchup: "Tampa Bay Buccaneers vs Atlanta Falcons",
        finalScore: "28 – 29",
        raiEdge: {
          team: "Tampa Bay Buccaneers",
          value: 1.96,
          levers: [
            { lever: "Early-down efficiency", value: 2.49 },
            { lever: "Pass protection integrity", value: 3.94 },
            { lever: "Coverage matchup stress", value: -4.47 }
          ]
        },
        pai: {
          teamA: {
            team: "Tampa Bay Buccaneers",
            score: "28 – 29",
            levers: [
              { lever: "Early-down efficiency", value: 0.5 },
              { lever: "Pass protection integrity", value: -1.39 },
              { lever: "Coverage matchup stress", value: -0.69 }
            ]
          },
          teamB: {
            team: "Atlanta Falcons",
            score: "28 – 29",
            levers: [
              { lever: "Early-down efficiency", value: -0.73 },
              { lever: "Pass protection integrity", value: -0.82 },
              { lever: "Coverage matchup stress", value: 1.36 }
            ]
          }
        }
      }
    ]
  };
}
