import { SOCCER_TEAMS } from "@/lib/data/soccerTeams";
import { getLastSoccerGame } from "@/lib/providers/espn";

function matchKey(dateUtc: string, a: string, b: string) {
  return `${dateUtc}-${[a, b].sort().join("-")}`;
}

export async function buildSoccerSnapshot() {
  const snapshot: any[] = [];
  const matches: Record<string, any[]> = {};

  for (const team of SOCCER_TEAMS) {
    const last = await getLastSoccerGame(team.id);
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

      // 🟦 PREGAME — Comparative RAI (Soccer logic)
      comparativeRAI: {
        delta: 3,
        edgeTeam: team.name,
        levers: [
          {
            lever: "Chance creation",
            advantage: team.name,
            value: 2,
          },
          {
            lever: "Defensive organization",
            advantage: "Opponent",
            value: 2,
          },
          {
            lever: "Game control",
            advantage: team.name,
            value: 3,
          },
        ],
      },

      // 🟥 POSTGAME — Comparative PAI (last match only)
      comparativePAI: {
        levers: [
          {
            lever: "Chance creation",
            status: "Confirmed as expected",
          },
          {
            lever: "Defensive organization",
            status: "Weakened vs expectation",
          },
          {
            lever: "Game control",
            status: "Confirmed as expected",
          },
        ],
        conclusion:
          "Outcome driven by execution gaps rather than pure structural mismatch.",
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
    sport: "SOCCER",
    updatedAt: new Date().toISOString(),
    matches: snapshot,
  };
}
