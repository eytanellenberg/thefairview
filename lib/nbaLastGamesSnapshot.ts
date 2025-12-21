// lib/nbaLastGamesSnapshot.ts

import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

type Lever = { lever: string; value: number };

type TeamSide = {
  id: string;
  name: string;
};

type MatchCard = {
  dateUtc: string;
  home: TeamSide;
  away: TeamSide;
  finalScore: string; // "112 – 105" (home – away)

  // Pregame (RAI) — proxy baseline (no next games)
  rai: {
    edgeTeam: string;
    edgeValue: number;
    levers: Lever[];
  };

  // Postgame (PAI) — derived from final margin
  pai: {
    home: { team: string; levers: Lever[] };
    away: { team: string; levers: Lever[] };
  };
};

export type NBALastGamesSnapshot = {
  sport: "nba";
  updatedAt: string;
  matches: MatchCard[];
};

function matchKey(dateUtc: string, aId: string, bId: string) {
  return `${dateUtc}-${[aId, bId].sort().join("-")}`;
}

function safeNum(x: unknown): number | null {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string" && x.trim() !== "") {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function formatScore(homeScore: number | null, awayScore: number | null): string {
  if (homeScore === null || awayScore === null) return "—";
  return `${homeScore} – ${awayScore}`;
}

// RAI proxy baseline (no future games, no leak from result)
function computeRAIProxy(homeName: string): { edgeTeam: string; edgeValue: number; levers: Lever[] } {
  // Minimal, stable, non-leaky baseline:
  // - home-court context (small +)
  // - tempo control (0)
  // - shot quality creation (0)
  const homeCourt = 0.4;

  return {
    edgeTeam: homeName,
    edgeValue: homeCourt,
    levers: [
      { lever: "Home-court context", value: homeCourt },
      { lever: "Tempo control", value: 0.0 },
      { lever: "Shot quality creation", value: 0.0 },
    ],
  };
}

// PAI from margin (postgame only — allowed to use score)
function computePAIFromMargin(
  homeName: string,
  awayName: string,
  homeScore: number | null,
  awayScore: number | null
): {
  home: { team: string; levers: Lever[] };
  away: { team: string; levers: Lever[] };
} {
  if (homeScore === null || awayScore === null) {
    return {
      home: { team: homeName, levers: [{ lever: "Execution delta", value: 0 }] },
      away: { team: awayName, levers: [{ lever: "Execution delta", value: 0 }] },
    };
  }

  const margin = homeScore - awayScore; // home minus away
  // Scale margin into small interpretable deltas
  const s = Math.max(-3, Math.min(3, margin / 10)); // clamp [-3, +3]

  // Home team levers
  const homeLevers: Lever[] = [
    { lever: "Offensive execution", value: s * 0.9 },
    { lever: "Shot conversion", value: s * 0.6 },
    { lever: "Defensive resistance", value: s * 0.7 },
  ];

  // Away team = symmetric opposite (execution deltas)
  const awayLevers: Lever[] = [
    { lever: "Offensive execution", value: -s * 0.9 },
    { lever: "Shot conversion", value: -s * 0.6 },
    { lever: "Defensive resistance", value: -s * 0.7 },
  ];

  return {
    home: { team: homeName, levers: homeLevers },
    away: { team: awayName, levers: awayLevers },
  };
}

export async function computeNBALastGamesSnapshot(): Promise<NBALastGamesSnapshot> {
  const byMatch: Record<string, any[]> = {};

  for (const team of NBA_TEAMS) {
    try {
      const { last } = await getLastAndNextGame("nba", team.id);
      if (!last) continue;

      const dateUtc: string = last.dateUtc;
      const homeId: string = last.home.id;
      const awayId: string = last.away.id;

      const key = matchKey(dateUtc, homeId, awayId);

      if (!byMatch[key]) byMatch[key] = [];
      byMatch[key].push({ team, last });
    } catch {
      // skip team on provider error
    }
  }

  const matches: MatchCard[] = [];

  for (const entries of Object.values(byMatch)) {
    // We expect 2 entries (one per team) for a completed match
    if (entries.length < 2) continue;

    const last = entries[0].last;
    const homeId: string = last.home.id;
    const awayId: string = last.away.id;

    const homeName: string = last.home.name;
    const awayName: string = last.away.name;

    const homeScore = safeNum(last.home.score);
    const awayScore = safeNum(last.away.score);

    const finalScore = formatScore(homeScore, awayScore);

    const rai = computeRAIProxy(homeName);
    const pai = computePAIFromMargin(homeName, awayName, homeScore, awayScore);

    matches.push({
      dateUtc: last.dateUtc,
      home: { id: homeId, name: homeName },
      away: { id: awayId, name: awayName },
      finalScore,
      rai,
      pai,
    });
  }

  // Sort newest first
  matches.sort((a, b) => (a.dateUtc < b.dateUtc ? 1 : a.dateUtc > b.dateUtc ? -1 : 0));

  return {
    sport: "nba",
    updatedAt: new Date().toISOString(),
    matches,
  };
}
