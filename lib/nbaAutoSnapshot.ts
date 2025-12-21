export type FAIRLever = {
  label: string;
  value: number;
};

export type FAIRRAI = {
  edge: string;
  value: number;
  levers: FAIRLever[];
};

export type FAIRPAITeam = {
  name: string;
  levers: FAIRLever[];
};

export type FAIRSurprise = {
  value: number;
  label: "Major Upset" | "Minor Upset" | "Logical Outcome" | "Structural Miss";
  color: "green" | "orange" | "gray" | "red";
};

export type FAIRMatch = {
  matchup: string;
  finalScore: string;
  rai: FAIRRAI;
  pai: {
    teamA: FAIRPAITeam;
    teamB: FAIRPAITeam;
  };
  fairSurprise: FAIRSurprise;
};

export type NBASnapshot = {
  sport: "nba";
  updatedAt: string;
  matches: FAIRMatch[];
};

/* ================= HELPERS ================= */

function scale(value: number, max = 3) {
  return Number(Math.max(-max, Math.min(max, value)).toFixed(2));
}

function computeFAIRSurprise(
  raiEdge: number,
  paiNet: number
): FAIRSurprise {
  const value = Number((paiNet - raiEdge).toFixed(2));

  if (value >= 2)
    return { value, label: "Major Upset", color: "green" };
  if (value >= 1)
    return { value, label: "Minor Upset", color: "orange" };
  if (value <= -1.5)
    return { value, label: "Structural Miss", color: "red" };

  return { value, label: "Logical Outcome", color: "gray" };
}

/* ================= MAIN ================= */

export function computeNBAAutoSnapshot(): NBASnapshot {
  const rawGames = [
    {
      home: "Denver Nuggets",
      away: "Houston Rockets",
      homeScore: 101,
      awayScore: 115,
      homeForm: -1.4,
      awayForm: 1.4,
      homeRecord: -0.7,
      awayRecord: 0.7,
    },
    {
      home: "LA Clippers",
      away: "Los Angeles Lakers",
      homeScore: 103,
      awayScore: 88,
      homeForm: 1.5,
      awayForm: -1.5,
      homeRecord: 0.75,
      awayRecord: -0.75,
    },
    // ➜ tu peux en ajouter autant que tu veux
  ];

  const matches: FAIRMatch[] = rawGames.map((g) => {
    const raiValue = scale(0.6 + g.homeForm + g.homeRecord);

    const rai: FAIRRAI = {
      edge: raiValue >= 0 ? g.home : g.away,
      value: Math.abs(raiValue),
      levers: [
        { label: "Home-court context", value: 0.6 },
        { label: "Recent scoring form", value: g.homeForm },
        { label: "Record proxy", value: g.homeRecord },
      ],
    };

    const margin = g.homeScore - g.awayScore;
    const paiHome = scale(margin / 8);
    const paiAway = scale(-margin / 8);

    const paiWinner =
      g.homeScore > g.awayScore ? paiHome : paiAway;

    const fairSurprise = computeFAIRSurprise(
      Math.abs(raiValue),
      paiWinner
    );

    return {
      matchup: `${g.home} vs ${g.away}`,
      finalScore: `${g.homeScore} – ${g.awayScore}`,
      rai,
      pai: {
        teamA: {
          name: g.home,
          levers: [
            { label: "Offensive execution", value: paiHome },
            { label: "Shot conversion", value: scale(paiHome * 0.7) },
            { label: "Defensive resistance", value: scale(paiHome * 0.8) },
          ],
        },
        teamB: {
          name: g.away,
          levers: [
            { label: "Offensive execution", value: paiAway },
            { label: "Shot conversion", value: scale(paiAway * 0.7) },
            { label: "Defensive resistance", value: scale(paiAway * 0.8) },
          ],
        },
      },
      fairSurprise,
    };
  });

  return {
    sport: "nba",
    updatedAt: new Date().toISOString(),
    matches,
  };
      }
