import { SOCCER_TEAMS } from "@/lib/data/soccerTeams";
import { getLastAndNextGame } from "@/lib/providers/espn";

export async function buildSoccerSnapshot() {
  const snapshot: any[] = [];

  for (const team of SOCCER_TEAMS) {
    try {
      const { last, next } = await getLastAndNextGame(
        "soccer",
        team.id
      );

      const opponentName =
        last
          ? last.home.id === team.id
            ? last.away.name
            : last.home.name
          : next
          ? next.home.id === team.id
            ? next.away.name
            : next.home.name
          : "Unknown";

      snapshot.push({
        team: {
          id: team.id,
          name: team.name,
          league: team.league,
        },

        lastGame: last
          ? {
              dateUtc: last.dateUtc,
              score:
                last.home.id === team.id
                  ? `${last.home.score} – ${last.away.score}`
                  : `${last.away.score} – ${last.home.score}`,
              opponent: opponentName,
              opponentId:
                last.home.id === team.id
                  ? last.away.id
                  : last.home.id,
            }
          : null,

        // 🔵 PREGAME — Comparative RAI (proxy, same as NBA for now)
        comparativeRAI: next
          ? {
              delta: 2,
              edgeTeam: team.name,
              levers: [
                {
                  lever: "Chance creation",
                  advantage: team.name,
                  value: 2,
                },
                {
                  lever: "Defensive compactness",
                  advantage: opponentName,
                  value: 3,
                },
                {
                  lever: "Game control",
                  advantage: team.name,
                  value: 1,
                },
              ],
              interpretation:
                "Small structural edge expected based on possession and chance profile.",
            }
          : null,

        // 🔴 POSTGAME — Comparative PAI
        comparativePAI: last
          ? {
              levers: [
                {
                  lever: "Chance conversion",
                  status: "Below expectation",
                },
                {
                  lever: "Defensive transitions",
                  status: "Confirmed as expected",
                },
                {
                  lever: "Game control",
                  status: "Weakened vs expectation",
                },
              ],
              conclusion:
                "Result driven by execution gaps rather than structural mismatch.",
            }
          : null,
      });
    } catch {
      // skip team on ESPN error
    }
  }

  return {
    sport: "Soccer",
    updatedAt: new Date().toISOString(),
    snapshot,
  };
}
