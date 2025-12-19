export type NFLRAILever = {
  lever: string;
  advantage: string;
  value: number;
};

export type NFLPAILever = {
  lever: string;
  status: string;
};

export type NFLMatchSnapshot = {
  match: string;
  finalScore: string;
  comparativeRAI: {
    edge: string;
    delta: number;
    levers: NFLRAILever[];
  };
  teams: {
    team: string;
    comparativePAI: {
      levers: NFLPAILever[];
    };
  }[];
};

export async function buildNFLSnapshot(): Promise<{
  sport: string;
  updatedAt: string;
  matches: NFLMatchSnapshot[];
}> {
  try {
    // ⚠️ TEMP DATA SAFE — remplacera ESPN plus tard
    const matches: NFLMatchSnapshot[] = [
      {
        match: "Atlanta Falcons vs Tampa Bay Buccaneers",
        finalScore: "29 – 28",
        comparativeRAI: {
          edge: "Atlanta Falcons",
          delta: 4,
          levers: [
            {
              lever: "Early-down efficiency",
              advantage: "Atlanta Falcons",
              value: 3,
            },
            {
              lever: "Pass protection integrity",
              advantage: "Atlanta Falcons",
              value: 2,
            },
            {
              lever: "Coverage matchup stress",
              advantage: "Tampa Bay Buccaneers",
              value: 5,
            },
          ],
        },
        teams: [
          {
            team: "Atlanta Falcons",
            comparativePAI: {
              levers: [
                {
                  lever: "Early-down efficiency",
                  status: "Confirmed as expected",
                },
                {
                  lever: "Pass protection integrity",
                  status: "Weakened vs expectation",
                },
                {
                  lever: "Coverage matchup stress",
                  status: "Outperformed vs expectation",
                },
              ],
            },
          },
          {
            team: "Tampa Bay Buccaneers",
            comparativePAI: {
              levers: [
                {
                  lever: "Early-down efficiency",
                  status: "Confirmed as expected",
                },
                {
                  lever: "Pass protection integrity",
                  status: "Weakened vs expectation",
                },
                {
                  lever: "Coverage matchup stress",
                  status: "Outperformed vs expectation",
                },
              ],
            },
          },
        ],
      },
    ];

    return {
      sport: "NFL",
      updatedAt: new Date().toISOString(),
      matches,
    };
  } catch (err) {
    // 🛟 FAILSAFE ABSOLU — JAMAIS CRASH
    return {
      sport: "NFL",
      updatedAt: new Date().toISOString(),
      matches: [],
    };
  }
}
