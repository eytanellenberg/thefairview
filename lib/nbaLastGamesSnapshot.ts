export interface NBALever {
  lever: string;
  value: number;
}

export interface NBAMatch {
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
    teamA: {
      team: string;
      score: string;
      levers: NBALever[];
    };
    teamB: {
      team: string;
      score: string;
      levers: NBALever[];
    };
  };
}

export interface NBASnapshot {
  sport: "nba";
  updatedAt: string;
  matches: NBAMatch[];
}

/**
 * LAST COMPLETED GAMES (FULL SLATE)
 * Static for now — deterministic — no API noise
 */
export function computeNBALastGamesSnapshot(): NBASnapshot {
  const matches: NBAMatch[] = [
    {
      matchup: "LA Clippers vs Los Angeles Lakers",
      finalScore: "103 – 88",
      rai: {
        edge: { team: "LA Clippers", value: 2.4 },
        levers: [
          { lever: "Recent form (last 5)", value: 1.6 },
          { lever: "Defensive rating trend", value: 0.8 }
        ]
      },
      pai: {
        teamA: {
          team: "LA Clippers",
          score: "103 – 88",
          levers: [
            { lever: "Offensive execution", value: 1.35 },
            { lever: "Shot conversion", value: 0.9 },
            { lever: "Defensive resistance", value: 1.05 }
          ]
        },
        teamB: {
          team: "Los Angeles Lakers",
          score: "88 – 103",
          levers: [
            { lever: "Offensive execution", value: -1.35 },
            { lever: "Shot conversion", value: -0.9 },
            { lever: "Defensive resistance", value: -1.05 }
          ]
        }
      }
    },

    {
      matchup: "Sacramento Kings vs Portland Trail Blazers",
      finalScore: "93 – 98",
      rai: {
        edge: { team: "Sacramento Kings", value: 1.8 },
        levers: [
          { lever: "Recent form (last 5)", value: 1.1 },
          { lever: "Defensive rating trend", value: 0.7 }
        ]
      },
      pai: {
        teamA: {
          team: "Sacramento Kings",
          score: "93 – 98",
          levers: [
            { lever: "Offensive execution", value: -0.45 },
            { lever: "Shot conversion", value: -0.3 },
            { lever: "Defensive resistance", value: -0.35 }
          ]
        },
        teamB: {
          team: "Portland Trail Blazers",
          score: "98 – 93",
          levers: [
            { lever: "Offensive execution", value: 0.45 },
            { lever: "Shot conversion", value: 0.3 },
            { lever: "Defensive resistance", value: 0.35 }
          ]
        }
      }
    }

    // 👉 tu ajoutes ici TOUS les matchs du slate
  ];

  return {
    sport: "nba",
    updatedAt: new Date().toISOString(),
    matches
  };
}
