import { NFL_TEAMS } from "@/lib/data/nflTeams";
import { getLastNFLGame } from "@/lib/providers/espn";

function matchKey(dateUtc: string, a: string, b: string) {
  return `${dateUtc}-${[a, b].sort().join("-")}`;
}

export async function buildNFLSnapshot() {
  const snapshot: any[] = [];
  const matches: Record<string, any[]> = {};

  for (const team of NFL_TEAMS) {
    const last = await getLastNFLGame(team.id);
    if (!last) continue;

    const opponentId =
      last.home.id === team.id ? last.away.id : last.home.id;

    const key = matchKey(last.dateUtc, team.id, opponentId);

    const entry = {
      team: {
        id: team.id,
        name: team.name,
      },

      lastGame: {
        dateUtc: last.dateUtc,
        score:
          last.home.id === team.id
            ? `${last.home.score} – ${last.away.score}`
            : `${last.away.score} – ${last.home.score}`,
        opponentId,
      },

      // 🟦 PREGAME — Comparative RAI (NFL logic)
      comparativeRAI: {
        delta: 4,
        edgeTeam: team.name,
        levers: [
          {
            lever: "Early-down efficiency",
            advantage: team.name,
            value: 3,
          },
          {
            lever: "Pass protection integrity",
            advantage: team.name,
            value: 2,
          },
          {
            lever: "Coverage matchup stress",
            advantage: "Opponent",
            value: 5,
          },
        ],
      },

      // 🟥 POSTGAME — Comparative PAI (last game only)
      comparativePAI: {
        levers: [
          {
            lever: "Early-down efficiency",
            status: "Confirmed as expected",
          },
          {
            lever: "Pass protection integrity",
            status: "Weakened vs expectation",
          },
          {
            lever: "Coverage matchup stress",
            status: "Outperformed vs expectation",
          },
        ],
        conclusion:
          "Outcome aligned with pregame structural expectations, with secondary deviations in protection.",
      },
    };

    if (!matches[key]) matches[key] = [];
    matches[key].push(entry);
  }

  for (const group of Object.values(matches)) {
    if (group.length === 2) {
      snapshot.push(group);
    }
  }

  return {
    sport: "NFL",
    updatedAt: new Date().toISOString(),
    matches: snapshot,
  };
}
