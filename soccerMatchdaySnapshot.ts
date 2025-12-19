// lib/soccerMatchdaySnapshot.ts

export type SoccerLever = {
  lever: string;
  value: number;
};

export type SoccerMatch = {
  matchup: string;
  finalScore: string;
  rai: {
    edgeTeam: string;
    edgeValue: number;
    levers: SoccerLever[];
  };
  pai: {
    home: {
      team: string;
      levers: SoccerLever[];
    };
    away: {
      team: string;
      levers: SoccerLever[];
    };
  };
};

export type SoccerSnapshot = {
  sport: "soccer";
  competition: string;
  matchday: string;
  updatedAt: string;
  matches: SoccerMatch[];
};

export function computeSoccerMatchdaySnapshot(): SoccerSnapshot {
  return {
    sport: "soccer",
    competition: "Ligue 1",
    matchday: "Last completed matchday",
    updatedAt: new Date().toISOString(),
    matches: [
      {
        matchup: "Lyon vs Le Havre AC",
        finalScore: "1 – 0",
        rai: {
          edgeTeam: "Lyon",
          edgeValue: 3.4,
          levers: [
            { lever: "Chance creation", value: 2.1 },
            { lever: "Game control", value: 1.7 },
            { lever: "Defensive organization", value: -0.4 }
          ]
        },
        pai: {
          home: {
            team: "Lyon",
            levers: [
              { lever: "Chance conversion", value: 0.6 },
              { lever: "Territorial control", value: 0.4 },
              { lever: "Defensive stability", value: -0.1 }
            ]
          },
          away: {
            team: "Le Havre AC",
            levers: [
              { lever: "Chance creation", value: -0.5 },
              { lever: "Game control", value: -0.6 },
              { lever: "Defensive resistance", value: 0.2 }
            ]
          }
        }
      },

      {
        matchup: "Marseille vs AS Monaco",
        finalScore: "1 – 0",
        rai: {
          edgeTeam: "Marseille",
          edgeValue: 2.8,
          levers: [
            { lever: "Pressing intensity", value: 1.9 },
            { lever: "Chance creation", value: 1.4 },
            { lever: "Defensive line stability", value: -0.5 }
          ]
        },
        pai: {
          home: {
            team: "Marseille",
            levers: [
              { lever: "Chance conversion", value: 0.5 },
              { lever: "Defensive duels", value: 0.7 },
              { lever: "Game control", value: 0.3 }
            ]
          },
          away: {
            team: "AS Monaco",
            levers: [
              { lever: "Chance creation", value: -0.4 },
              { lever: "Defensive positioning", value: 0.2 },
              { lever: "Midfield control", value: -0.6 }
            ]
          }
        }
      }
    ]
  };
}
