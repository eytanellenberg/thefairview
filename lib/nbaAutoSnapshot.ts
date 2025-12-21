import { getNBAGames } from "@/lib/providers/espn";

/* ================= TYPES ================= */

export type FAIRLever = {
  label: string;
  value: number;
};

export type FAIRTeamPAI = {
  name: string;
  levers: FAIRLever[];
};

export type FAIRMatch = {
  matchup: string;
  finalScore: string;
  rai: {
    edge: string;
    value: number;
    levers: FAIRLever[];
  };
  pai: {
    teamA: FAIRTeamPAI;
    teamB: FAIRTeamPAI;
  };
};

export type NBAAutoSnapshot = {
  sport: "nba";
  updatedAt: string;
  matches: FAIRMatch[];
};

/* ================= HELPERS ================= */

function computeRAI(): { value: number; levers: FAIRLever[] } {
  // 🔹 PLACEHOLDER STRUCTURE — logique stable
  const recentForm = +(Math.random() * 2 - 1).toFixed(2);
  const defenseTrend = +(Math.random() * 1.5 - 0.75).toFixed(2);

  return {
    value: +(recentForm + defenseTrend).toFixed(2),
    levers: [
      { label: "Recent form (last 5)", value: recentForm },
      { label: "Defensive rating trend", value: defenseTrend },
    ],
  };
}

function computePAI(diff: number): FAIRLever[] {
  return [
    { label: "Offensive execution", value: +(diff * 0.6).toFixed(2) },
    { label: "Shot conversion", value: +(diff * 0.4).toFixed(2) },
    { label: "Defensive resistance", value: +(diff * 0.5).toFixed(2) },
  ];
}

/* ================= MAIN ================= */

/**
 * AUTO = last completed NBA games only
 * NO next games
 * NO manual input
 */
export async function computeNBAAutoSnapshot(): Promise<NBAAutoSnapshot> {
  const events = await getNBAGames(); // ✅ AWAIT ICI

  const matches: FAIRMatch[] = events.map((event) => {
    const comp = event.competitions[0];
    const home = comp.competitors.find((c) => c.homeAway === "home")!;
    const away = comp.competitors.find((c) => c.homeAway === "away")!;

    const homeScore = Number(home.score ?? 0);
    const awayScore = Number(away.score ?? 0);
    const diff = homeScore - awayScore;

    const rai = computeRAI();
    const edgeTeam = rai.value >= 0 ? home.team.name : away.team.name;

    return {
      matchup: `${home.team.name} vs ${away.team.name}`,
      finalScore: `${homeScore} – ${awayScore}`,
      rai: {
        edge: edgeTeam,
        value: Math.abs(rai.value),
        levers: rai.levers,
      },
      pai: {
        teamA: {
          name: home.team.name,
          levers: computePAI(diff),
        },
        teamB: {
          name: away.team.name,
          levers: computePAI(-diff),
        },
      },
    };
  });

  return {
    sport: "nba",
    updatedAt: new Date().toISOString(),
    matches,
  };
}
