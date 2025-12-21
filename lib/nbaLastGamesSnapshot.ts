export type NBALever = {
  lever: string;
  value: number;
};

export type NBATeamPAI = {
  team: string;
  score: string;
  levers: NBALever[];
};

export type NBAMatch = {
  matchup: string;
  finalScore: string;
  rai: {
    edge: {
      team: string;
      value: number;
    };
    levers: NBALever[];
  };
  pai: {
    teamA: NBATeamPAI;
    teamB: NBATeamPAI;
  };
};

export type NBALastGamesSnapshot = {
  sport: "nba";
  updatedAt: string;
  matches: NBAMatch[];
};

/**
 * TEMP snapshot — last completed games
 * (Stable structure, no ESPN dependency)
 */
export function computeNBALastGamesSnapshot(): NBALastGamesSnapshot {
  return {
    sport: "nba",
    updatedAt: new Date().toISOString(),
    matches: [
      {
        matchup: "LA Clippers vs Los Angeles Lakers",
        finalScore: "103 – 88",
        rai: {
          edge: {
            team: "LA Clippers",
            value: 2.4,
          },
          levers: [
            { lever: "Recent form (last 5)", value: 1.6 },
            { lever: "Defensive rating trend", value: 0.8 },
          ],
        },
        pai: {
          teamA: {
            team: "LA Clippers",
            score: "103 – 88",
            levers: [
              { lever: "Offensive execution", value: 1.35 },
              { lever: "Shot conversion", value: 0.9 },
              { lever: "Defensive resistance", value: 1.05 },
            ],
          },
          teamB: {
            team: "Los Angeles Lakers",
            score: "88 – 103",
            levers: [
              { lever: "Offensive execution", value: -1.35 },
              { lever: "Shot conversion", value: -0.9 },
              { lever: "Defensive resistance", value: -1.05 },
            ],
          },
        },
      },
    ],
  };
}
