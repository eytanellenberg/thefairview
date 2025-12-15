export const nbaRecentMatches = [
  {
    matchId: "NBA_2025_12_14_LAL_BOS",
    date: "2025-12-14",
    home: "BOS",
    away: "LAL",
    score: "112–108",
    rai: {
      BOS: {
        score: 74,
        levers: [
          { name: "Rest advantage", w: 0.22 },
          { name: "Bench depth", w: 0.18 },
          { name: "Defensive trend", w: 0.16 }
        ]
      },
      LAL: {
        score: 66,
        levers: [
          { name: "Star availability", w: 0.21 },
          { name: "Travel load", w: -0.14 },
          { name: "Turnover risk", w: -0.11 }
        ]
      }
    },
    pai: {
      BOS: {
        score: 71,
        drivers: [
          { name: "Execution", w: 0.24 },
          { name: "Rebounding", w: 0.17 },
          { name: "Clutch FT", w: 0.12 }
        ]
      },
      LAL: {
        score: 63,
        drivers: [
          { name: "Shot quality", w: 0.18 },
          { name: "Turnovers", w: -0.19 },
          { name: "3PT variance", w: -0.10 }
        ]
      }
    },
    correlation: {
      label: "RAI → PAI alignment",
      value: 0.42
    },
    explanation:
      "RAI captures pre-game readiness. PAI captures in-game impact. Alignment reflects how readiness translated into performance."
  }
]
