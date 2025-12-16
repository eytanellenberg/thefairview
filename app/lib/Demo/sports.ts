export type Lever = { name: string; w: number; note?: string };

export type Match = {
  id: string;
  date: string;
  opponent: string;
  homeAway: "H" | "A";
  score: string; // "112–108"
  raiPre: number; // 0-100
  paiPost: number; // 0-100
  preLevers: Lever[];
  postLevers: Lever[];
  predictedEdge: string; // "Team +3.2"
  actualOutcome: "W" | "L";
  alignment: number; // 0-1
};

export type NextMatch = {
  date: string;
  opponent: string;
  homeAway: "H" | "A";
  raiForecast: number;
  forecastLevers: Lever[];
};

export type TeamPack = {
  team: string;
  recent: Match[];
  next: NextMatch;
};

export type SportPack = {
  sport: "nba" | "nfl" | "mlb" | "soccer";
  label: string;
  description: string;
  teams: TeamPack[];
};

export const SPORTS: SportPack[] = [
  {
    sport: "nba",
    label: "NBA",
    description: "Basketball — readiness → impact attribution (demo).",
    teams: [
      {
        team: "BOS",
        recent: [
          {
            id: "NBA_BOS_LAL_2025_12_14",
            date: "2025-12-14",
            opponent: "LAL",
            homeAway: "H",
            score: "112–108",
            raiPre: 74,
            paiPost: 71,
            preLevers: [
              { name: "Rest advantage", w: 0.22 },
              { name: "Bench depth", w: 0.18 },
              { name: "Defensive trend", w: 0.16 }
            ],
            postLevers: [
              { name: "Half-court execution", w: 0.24 },
              { name: "Rebounding", w: 0.17 },
              { name: "Turnover control", w: 0.11 }
            ],
            predictedEdge: "BOS +2.8",
            actualOutcome: "W",
            alignment: 0.62
          }
        ],
        next: {
          date: "2025-12-16",
          opponent: "MIA",
          homeAway: "H",
          raiForecast: 76,
          forecastLevers: [
            { name: "Rest advantage", w: 0.20 },
            { name: "Defensive consistency", w: 0.16 },
            { name: "Rotation stability", w: 0.14 }
          ]
        }
      },
      {
        team: "LAL",
        recent: [
          {
            id: "NBA_LAL_BOS_2025_12_14",
            date: "2025-12-14",
            opponent: "BOS",
            homeAway: "A",
            score: "108–112",
            raiPre: 66,
            paiPost: 63,
            preLevers: [
              { name: "Star availability", w: 0.21 },
              { name: "Travel load", w: -0.14 },
              { name: "Turnover risk", w: -0.11 }
            ],
            postLevers: [
              { name: "Turnovers", w: -0.19 },
              { name: "3PT variance", w: -0.10 },
              { name: "Paint efficiency", w: 0.12 }
            ],
            predictedEdge: "BOS +2.8",
            actualOutcome: "L",
            alignment: 0.58
          }
        ],
        next: {
          date: "2025-12-16",
          opponent: "DEN",
          homeAway: "H",
          raiForecast: 64,
          forecastLevers: [
            { name: "Travel fatigue residual", w: -0.12 },
            { name: "Turnover risk", w: -0.10 },
            { name: "Star availability", w: 0.18 }
          ]
        }
      }
    ]
  },

  {
    sport: "nfl",
    label: "NFL",
    description: "American football — readiness & game impact (demo).",
    teams: [
      {
        team: "KC",
        recent: [
          {
            id: "NFL_KC_BUF_2025_12_08",
            date: "2025-12-08",
            opponent: "BUF",
            homeAway: "H",
            score: "27–24",
            raiPre: 73,
            paiPost: 70,
            preLevers: [
              { name: "QB continuity", w: 0.24 },
              { name: "OL health", w: 0.17 },
              { name: "Home advantage", w: 0.10 }
            ],
            postLevers: [
              { name: "3rd down efficiency", w: 0.22 },
              { name: "Red zone conversion", w: 0.15 },
              { name: "Turnover margin", w: 0.12 }
            ],
            predictedEdge: "KC +1.9",
            actualOutcome: "W",
            alignment: 0.64
          }
        ],
        next: {
          date: "2025-12-16",
          opponent: "CIN",
          homeAway: "A",
          raiForecast: 69,
          forecastLevers: [
            { name: "Travel", w: -0.06 },
            { name: "QB continuity", w: 0.22 },
            { name: "Defensive pressure rate", w: 0.14 }
          ]
        }
      }
    ]
  },

  {
    sport: "mlb",
    label: "MLB",
    description: "Baseball — pre-game roster & pitching to post-game impact (demo).",
    teams: [
      {
        team: "NYY",
        recent: [
          {
            id: "MLB_NYY_BOS_2025_10_01",
            date: "2025-10-01",
            opponent: "BOS",
            homeAway: "H",
            score: "5–3",
            raiPre: 71,
            paiPost: 68,
            preLevers: [
              { name: "Starting pitcher edge", w: 0.26 },
              { name: "Bullpen freshness", w: 0.14 },
              { name: "Lineup availability", w: 0.12 }
            ],
            postLevers: [
              { name: "Hard-hit rate", w: 0.18 },
              { name: "Bullpen leverage", w: 0.16 },
              { name: "Defensive runs saved", w: 0.10 }
            ],
            predictedEdge: "NYY +0.7",
            actualOutcome: "W",
            alignment: 0.55
          }
        ],
        next: {
          date: "2026-03-28",
          opponent: "TOR",
          homeAway: "A",
          raiForecast: 70,
          forecastLevers: [
            { name: "Starting pitcher edge", w: 0.22 },
            { name: "Travel", w: -0.05 },
            { name: "Bullpen freshness", w: 0.12 }
          ]
        }
      }
    ]
  },

  {
    sport: "soccer",
    label: "Soccer",
    description: "Football — readiness attribution and match impact (demo).",
    teams: [
      {
        team: "ARS",
        recent: [
          {
            id: "SOC_ARS_MCI_2025_12_09",
            date: "2025-12-09",
            opponent: "MCI",
            homeAway: "H",
            score: "2–2",
            raiPre: 70,
            paiPost: 67,
            preLevers: [
              { name: "Squad rotation stability", w: 0.18 },
              { name: "Injury load", w: -0.11 },
              { name: "Pressing readiness", w: 0.16 }
            ],
            postLevers: [
              { name: "xG quality", w: 0.20 },
              { name: "Transitions conceded", w: -0.14 },
              { name: "Set pieces", w: 0.10 }
            ],
            predictedEdge: "Even (0.0)",
            actualOutcome: "W",
            alignment: 0.41
          }
        ],
        next: {
          date: "2025-12-16",
          opponent: "CHE",
          homeAway: "A",
          raiForecast: 68,
          forecastLevers: [
            { name: "Injury load", w: -0.10 },
            { name: "Pressing readiness", w: 0.15 },
            { name: "Rest differential", w: 0.08 }
          ]
        }
      }
    ]
  }
];
