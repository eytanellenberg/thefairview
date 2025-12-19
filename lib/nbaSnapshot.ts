import { NBA_TEAMS } from "@/lib/data/nbaTeams";
import { getLastGame } from "@/lib/providers/espn";

type TeamSnapshot = {
  team: {
    id: string;
    name: string;
  };
  score: string;
};

type MatchSnapshot = {
  dateUtc: string;
  home: TeamSnapshot;
  away: TeamSnapshot;
};

export async function buildNBASnapshot() {
  const matches = new Map<string, MatchSnapshot>();

  for (const team of NBA_TEAMS) {
    const last = await getLastGame("nba", team.id);
    if (!last) continue;

    const key = `${last.dateUtc}-${[last.home.id, last.away.id]
      .sort()
      .join("-")}`;

    if (!matches.has(key)) {
      matches.set(key, {
        dateUtc: last.dateUtc,
        home: null as any,
        away: null as any,
      });
    }

    const match = matches.get(key)!;
    const isHome = last.home.id === team.id;

    const teamBlock: TeamSnapshot = {
      team: {
        id: team.id,
        name: team.name,
      },
      score: isHome
        ? `${last.home.score} – ${last.away.score}`
        : `${last.away.score} – ${last.home.score}`,
    };

    if (isHome) match.home = teamBlock;
    else match.away = teamBlock;
  }

  const snapshot = Array.from(matches.values()).filter(
    (m) => m.home && m.away
  );

  return {
    sport: "NBA",
    updatedAt: new Date().toISOString(),
    matches: snapshot.map((m) => ({
      dateUtc: m.dateUtc,
      home: {
        ...m.home,
        comparativeRAI: {
          edge: m.home.team.name,
          delta: 3,
          levers: [
            { lever: "Offensive spacing", value: 2 },
            { lever: "Shot quality creation", value: 3 },
          ],
        },
        comparativePAI: {
          conclusion:
            "Victory achieved despite weaker-than-expected offensive execution.",
        },
      },
      away: {
        ...m.away,
        comparativeRAI: {
          edge: m.away.team.name,
          delta: 3,
          levers: [{ lever: "PnR matchup stress", value: 6 }],
        },
        comparativePAI: {
          conclusion:
            "Performance aligned with pre-game structural expectations.",
        },
      },
    })),
  };
}
