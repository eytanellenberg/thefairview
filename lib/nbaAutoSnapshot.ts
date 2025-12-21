import { getNBAGames } from "@/lib/providers/espn";

/* ================= CONSTANTS ================= */

const NBA_SCORE_NORM = 12; // écart moyen NBA
const MAX_PAI = 2.5;

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
  updatedAt: string;
  matches: FAIRMatch[];
};

/* ================= HELPERS ================= */

function clamp(value: number, max = MAX_PAI) {
  return Math.max(-max, Math.min(max, value));
}

/* ================= CORE ================= */

export async function computeNBAAutoSnapshot(): Promise<NBAAutoSnapshot> {
  const events = await getNBAGames();

  const games = events.filter(
    (g) => g.status === "FINAL" && g.home && g.away
  );

  const matches: FAIRMatch[] = games.map((game) => {
    const home = game.home;
    const away = game.away;

    const scoreDiff = home.score - away.score;
    const norm = scoreDiff / NBA_SCORE_NORM;

    /* ---------- PAI (POSTGAME EXECUTION) ---------- */

    const offensive = clamp(norm * 1.0);
    const shot = clamp(norm * 0.7);
    const defense = clamp(norm * 0.9);

    /* ---------- RAI (STRUCTURAL EDGE — LIGHT) ---------- */

    const raiValue = clamp(
      (home.recentForm - away.recentForm) * 0.6 +
        (home.defensiveTrend - away.defensiveTrend) * 0.4,
      2
    );

    const raiEdge =
      raiValue > 0 ? home.name : away.name;

    return {
      matchup: `${home.name} vs ${away.name}`,
      finalScore: `${home.score} – ${away.score}`,

      rai: {
        edge: raiEdge,
        value: Math.abs(Number(raiValue.toFixed(2))),
        levers: [
          {
            label: "Recent form (last 5)",
            value: Number(
              ((home.recentForm - away.recentForm) * 0.6).toFixed(2)
            ),
          },
          {
            label: "Defensive rating trend",
            value: Number(
              ((home.defensiveTrend - away.defensiveTrend) * 0.4).toFixed(2)
            ),
          },
        ],
      },

      pai: {
        teamA: {
          name: home.name,
          levers: [
            { label: "Offensive execution", value: Number(offensive.toFixed(2)) },
            { label: "Shot conversion", value: Number(shot.toFixed(2)) },
            { label: "Defensive resistance", value: Number(defense.toFixed(2)) },
          ],
        },
        teamB: {
          name: away.name,
          levers: [
            { label: "Offensive execution", value: Number((-offensive).toFixed(2)) },
            { label: "Shot conversion", value: Number((-shot).toFixed(2)) },
            { label: "Defensive resistance", value: Number((-defense).toFixed(2)) },
          ],
        },
      },
    };
  });

  return {
    updatedAt: new Date().toISOString(),
    matches,
  };
}
