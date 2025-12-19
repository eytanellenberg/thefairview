export type SoccerRAILever = {
  lever: string;
  team: string;
  value: number;
};

export type SoccerPAILever = {
  lever: string;
  delta: number;
};

export type SoccerPAITeam = {
  team: string;
  score: string;
  levers: SoccerPAILever[];
};

export type SoccerMatch = {
  home: string;
  away: string;
  score: string;
  rai: {
    edgeTeam: string;
    delta: number;
    levers: SoccerRAILever[];
  };
  pai: SoccerPAITeam[];
};

export async function computeSoccerBigScoreSnapshot(): Promise<{
  updatedAt: string;
  matches: SoccerMatch[];
}> {
  return {
    updatedAt: new Date().toISOString(),
    matches: [
      {
        home: "Lyon",
        away: "Le Havre AC",
        score: "1 – 0",
        rai: {
          edgeTeam: "Lyon",
          delta: 2.85,
          levers: [
            { lever: "Chance creation", team: "Lyon", value: 1.9 },
            { lever: "Game control", team: "Lyon", value: 2.4 },
            { lever: "Defensive organization", team: "Le Havre AC", value: 1.6 }
          ]
        },
        pai: [
          {
            team: "Lyon",
            score: "1 – 0",
            levers: [
              { lever: "Chance creation", delta: 0.6 },
              { lever: "Game control", delta: 0.4 },
              { lever: "Defensive organization", delta: -0.2 }
            ]
          },
          {
            team: "Le Havre AC",
            score: "1 – 0",
            levers: [
              { lever: "Chance creation", delta: -0.7 },
              { lever: "Game control", delta: -0.5 },
              { lever: "Defensive organization", delta: 0.3 }
            ]
          }
        ]
      }
    ]
  };
}
