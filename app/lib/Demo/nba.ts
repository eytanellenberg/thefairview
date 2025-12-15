export const nbaRecentMatches = [
  {
    matchId: "NBA_2025_12_14_LAL_BOS",
    date: "2025-12-14",
    home: "BOS",
    away: "LAL",
    score: "112–108",
    rai: {
      BOS: { score: 74, levers: [{ name: "Rest advantage", w: 0.22 }, { name: "Bench depth", w: 0.18 }, { name: "Defensive rating trend", w: 0.16 }] },
      LAL: { score: 66, levers: [{ name: "Star availability", w: 0.21 }, { name: "Travel load", w: -0.14 }, { name: "Turnover risk", w: -0.11 }] }
    },
    pai: {
      BOS: { score: 71, drivers: [{ name: "Half-court execution", w: 0.24 }, { name: "Rebounds", w: 0.17 }, { name: "Clutch FT rate", w: 0.12 }] },
      LAL: { score: 63, drivers: [{ name: "Shot quality", w: 0.18 }, { name: "Turnovers", w: -0.19 }, { name: "3PT variance", w: -0.10 }] }
    },
    correlation: { label: "RAI→PAI alignment", value: 0.42 },
    explanation:
      "RAI reflects pre-match readiness signals (availability, rest, travel, role stability). PAI reflects post-match impact signals (execution, rebounding, turnovers)."
  },
  {
    matchId: "NBA_2025_12_13_GSW_PHO",
    date: "2025-12-13",
    home: "GSW",
    away: "PHO",
    score: "118–121",
    rai: {
      GSW: { score: 69, levers: [{ name: "Pace control", w: 0.20 }, { name: "Home advantage", w: 0.15 }, { name: "Injury uncertainty", w: -0.12 }] },
      PHO: { score: 73, levers: [{ name: "Shot creation", w: 0.23 }, { name: "Rest advantage", w: 0.17 }, { name: "Transition edge", w: 0.14 }] }
    },
    pai: {
      GSW: { score: 65, drivers: [{ name: "Turnovers", w: -0.22 }, { name: "3PT efficiency", w: 0.19 }, { name: "Defensive lapses", w: -0.12 }] },
      PHO: { score: 74, drivers: [{ name: "Shot making", w: 0.26 }, { name: "Clutch execution", w: 0.18 }, { name: "FT rate", w: 0.11 }] }
    },
    correlation: { label: "RAI→PAI alignment", value: 0.51 },
    explanation:
      "Correlation is illustrative: higher alignment means readiness translated into match impact; low alignment suggests variance or tactical disruption."
  }
]

export const nbaNextMatches = [
  { team: "BOS", opponent: "MIA", date: "2025-12-16", raiScore: 76, topLevers: ["Rest advantage", "Defensive consistency", "Bench depth"] },
  { team: "LAL", opponent: "DEN", date: "2025-12-16", raiScore: 64, topLevers: ["Travel load", "Turnover risk", "Star availability"] },
  { team: "GSW", opponent: "SAC", date: "2025-12-16", raiScore: 70, topLevers: ["Pace control", "Home/away context", "Role stability"] },
  { team: "PHO", opponent: "DAL", date: "2025-12-16", raiScore: 74, topLevers: ["Shot creation", "Transition edge", "Rest"] }
]
