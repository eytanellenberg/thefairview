import { NFL_TEAMS } from "@/lib/data/nflTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

/* ================= TYPES ================= */

export type NFLLever = {
  lever: string;
  advantage: string;
  value: number;
};

export type ComparativeRAI = {
  edge: string;
  delta: number;
  levers: NFLLever[];
};

export type TeamPAI = {
  team: string;
  lastScore: string;
  levers: {
    lever: string;
    delta: number;
  }[];
};

export type NFLMatchCard = {
  home: string;
  away: string;
  finalScore: string;
  comparativeRAI: ComparativeRAI;
  postgamePAI: TeamPAI[];
};

/* ================= SNAPSHOT ================= */

export async function buildNFLSnapshot(): Promise<{
  sport: "nfl";
  updatedAt: string;
  matches: NFLMatchCard[];
}> {
  const matches: NFLMatchCard[] = [];
  const seen = new Set<string>();

  for (const team of NFL_TEAMS) {
    const { last } = await getLastAndNextGame("nfl", team.id);
    if (!last) continue;

    const home = last.home.name;
    const away = last.away.name;

    const key = [home, away].sort().join("-");
    if (seen.has(key)) continue;
    seen.add(key);

    const hs = last.home.score;
    const as = last.away.score;

    const finalScore =
      typeof hs === "number" && typeof as === "number"
        ? `${hs} – ${as}`
        : "—";

    /* -------- RAI COMPARATIF -------- */

    const earlyDown = 2 + Math.random() * 4;
    const protection = 1 + Math.random() * 3;
    const coverage = 1 + Math.random() * 4;

    const deltaRaw = earlyDown + protection - coverage;
    const edge = deltaRaw >= 0 ? home : away;

    const comparativeRAI: ComparativeRAI = {
      edge,
      delta: Math.abs(+deltaRaw.toFixed(2)),
      levers: [
        {
          lever: "Early-down efficiency",
          advantage: home,
          value: +earlyDown.toFixed(2),
        },
        {
          lever: "Pass protection integrity",
          advantage: home,
          value: +protection.toFixed(2),
        },
        {
          lever: "Coverage matchup stress",
          advantage: away,
          value: +coverage.toFixed(2),
        },
      ],
    };

    /* -------- PAI POSTGAME -------- */

    const homePAI: TeamPAI = {
      team: home,
      lastScore: finalScore,
      levers: [
        {
          lever: "Early-down efficiency",
          delta: +(Math.random() * 3 - 1.5).toFixed(2),
        },
        {
          lever: "Pass protection integrity",
          delta: +(Math.random() * 3 - 1.5).toFixed(2),
        },
        {
          lever: "Coverage matchup stress",
          delta: +(Math.random() * 3 - 1.5).toFixed(2),
        },
      ],
    };

    const awayPAI: TeamPAI = {
      team: away,
      lastScore: finalScore,
      levers: [
        {
          lever: "Early-down efficiency",
          delta: +(Math.random() * 3 - 1.5).toFixed(2),
        },
        {
          lever: "Pass protection integrity",
          delta: +(Math.random() * 3 - 1.5).toFixed(2),
        },
        {
          lever: "Coverage matchup stress",
          delta: +(Math.random() * 3 - 1.5).toFixed(2),
        },
      ],
    };

    matches.push({
      home,
      away,
      finalScore,
      comparativeRAI,
      postgamePAI: [homePAI, awayPAI],
    });
  }

  return {
    sport: "nfl",
    updatedAt: new Date().toISOString(),
    matches,
  };
}
