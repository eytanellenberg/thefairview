import { getNBAGames } from "@/lib/providers/espn";

/* ================= TYPES ================= */

type TeamGame = {
  team: string;
  pointsFor: number;
  pointsAgainst: number;
};

type Match = {
  matchup: string;
  finalScore: string;
  rai: {
    edge: {
      team: string;
      value: number;
    };
    levers: { lever: string; value: number }[];
  };
  pai: {
    teamA: PAIBlock;
    teamB: PAIBlock;
  };
};

type PAIBlock = {
  team: string;
  score: string;
  levers: { lever: string; value: number }[];
};

export type NBALastGamesSnapshot = {
  sport: "nba";
  updatedAt: string;
  matches: Match[];
};

/* ================= HELPERS ================= */

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ================= CORE ================= */

export async function computeNBALastGamesSnapshot(): Promise<NBALastGamesSnapshot> {
  const games = await getNBAGames({ status: "completed" });

  // 1. Build last games per team
  const byTeam: Record<string, TeamGame[]> = {};

  for (const g of games) {
    const home = g.home;
    const away = g.away;

    if (!home || !away) continue;
    if (home.score == null || away.score == null) continue;

    byTeam[home.name] ??= [];
    byTeam[away.name] ??= [];

    byTeam[home.name].push({
      team: home.name,
      pointsFor: home.score,
      pointsAgainst: away.score,
    });

    byTeam[away.name].push({
      team: away.name,
      pointsFor: away.score,
      pointsAgainst: home.score,
    });
  }

  // 2. Keep last 5 games per team
  for (const t in byTeam) {
    byTeam[t] = byTeam[t].slice(-5);
  }

  // 3. Build matches (unique games)
  const matches: Match[] = [];

  for (const g of games) {
    const home = g.home;
    const away = g.away;
    if (!home || !away) continue;
    if (home.score == null || away.score == null) continue;

    const teamA = home.name;
    const teamB = away.name;

    const recentA = byTeam[teamA] ?? [];
    const recentB = byTeam[teamB] ?? [];

    if (!recentA.length || !recentB.length) continue;

    const diffA = avg(
      recentA.map((m) => m.pointsFor - m.pointsAgainst)
    );
    const diffB = avg(
      recentB.map((m) => m.pointsFor - m.pointsAgainst)
    );

    const deltaRAI = round(diffA - diffB);

    const raiEdgeTeam = deltaRAI >= 0 ? teamA : teamB;

    // PAI from last match margin
    const margin = home.score - away.score;

    const paiA = round(margin / 10);
    const paiB = round(-margin / 10);

    matches.push({
      matchup: `${teamA} vs ${teamB}`,
      finalScore: `${home.score} – ${away.score}`,
      rai: {
        edge: {
          team: raiEdgeTeam,
          value: Math.abs(deltaRAI),
        },
        levers: [
          {
            lever: "Recent point differential (last 5)",
            value: round(diffA),
          },
          {
            lever: "Opponent recent differential",
            value: round(-diffB),
          },
        ],
      },
      pai: {
        teamA: {
          team: teamA,
          score: `${home.score} – ${away.score}`,
          levers: [
            {
              lever: "Offensive execution",
              value: paiA,
            },
            {
              lever: "Shot conversion",
              value: round(paiA * 0.7),
            },
            {
              lever: "Defensive resistance",
              value: round(paiA * 0.8),
            },
          ],
        },
        teamB: {
          team: teamB,
          score: `${home.score} – ${away.score}`,
          levers: [
            {
              lever: "Offensive execution",
              value: paiB,
            },
            {
              lever: "Shot conversion",
              value: round(paiB * 0.7),
            },
            {
              lever: "Defensive resistance",
              value: round(paiB * 0.8),
            },
          ],
        },
      },
    });
  }

  return {
    sport: "nba",
    updatedAt: new Date().toISOString(),
    matches,
  };
          }
